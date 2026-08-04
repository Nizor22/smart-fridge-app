import { Alert } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY!;
if (!GEMINI_API_KEY) console.warn('EXPO_PUBLIC_GEMINI_API_KEY is not set in .env');

// Current available models (Aug 2026) — 2.x series is fully retired
const MODEL_CHAIN = ['gemini-3.5-flash', 'gemini-3.5-flash-lite'];

// ── Category images ──
const CATEGORY_IMAGES: Record<string, string> = {
  Produce: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80',
  Dairy: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&q=80',
  Meat: 'https://images.unsplash.com/photo-1607623814075-e51df1bd682f?w=400&q=80',
  Beverage: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80',
  Pantry: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400&q=80',
  Leftovers: 'https://images.unsplash.com/photo-1599553550269-e090f777cce1?w=400&q=80',
  Other: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400&q=80',
};

export function getImageForCategory(category: string): string {
  return CATEGORY_IMAGES[category] || CATEGORY_IMAGES.Other;
}

// ── Raw fetch with model fallback ──
async function callGemini(body: object): Promise<any> {
  let lastError: any;

  for (const model of MODEL_CHAIN) {
    // Retry each model up to 2 times (handles cold-start transient errors)
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        console.log(`[AI] Trying ${model} (attempt ${attempt + 1})`);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const errText = await response.text();
          const isRetryable = response.status === 429 || response.status === 503;
          const isModelGone = response.status === 404;

          if (isRetryable && attempt === 0) {
            // Wait 2s and retry same model
            console.warn(`[AI] ${model} returned ${response.status}, retrying in 2s...`);
            await new Promise(r => setTimeout(r, 2000));
            continue;
          }
          if (isRetryable || isModelGone) {
            // Move to next model
            console.warn(`[AI] ${model} failed (${response.status}), trying next model...`);
            lastError = new Error(`${response.status}: ${errText.substring(0, 200)}`);
            break;
          }
          throw new Error(`API ${response.status}: ${errText.substring(0, 300)}`);
        }

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
          console.warn(`[AI] ${model} returned empty text, retrying...`);
          if (attempt === 0) { await new Promise(r => setTimeout(r, 1500)); continue; }
          break;
        }

        // Try to parse — truncated responses will fail here
        try {
          const parsed = JSON.parse(text);
          console.log(`[AI] Success with: ${model}`);
          return parsed;
        } catch (parseErr) {
          console.warn(`[AI] ${model} returned truncated JSON (${text.length} chars), retrying...`);
          lastError = parseErr;
          if (attempt === 0) { await new Promise(r => setTimeout(r, 1500)); continue; }
          break;
        }
      } catch (error: any) {
        lastError = error;
        const msg = error?.message || '';
        if (msg.includes('429') || msg.includes('503') || msg.includes('quota') || msg.includes('JSON')) {
          if (attempt === 0) {
            console.warn(`[AI] ${model} error, retrying in 2s...`);
            await new Promise(r => setTimeout(r, 2000));
            continue;
          }
          break;
        }
        if (msg.includes('404')) break;
        throw error;
      }
    }
  }

  throw lastError;
}

// ── 1. VISION SCANNER ──
export async function analyzeFridgeImage(base64Image: string) {
  try {
    const result = await callGemini({
      contents: [{
        parts: [
          {
            text: 'Identify every food item in this photo. Return a JSON object: {"items":[{"name":"...","category":"Produce|Dairy|Meat|Beverage|Pantry|Leftovers","urgency":"FRESH|EXPIRING_SOON|EXPIRED","quantity":1,"unit":"item"}]}',
          },
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        ],
      }],
      generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 4096 },
    });

    const items = result?.items || (Array.isArray(result) ? result : [result]);
    return items.map((item: any) => ({
      name: item.name || 'Unknown Item',
      category: item.category || 'Pantry',
      urgency: item.urgency || 'FRESH',
      quantity: Number(item.quantity) || 1,
      unit: item.unit || 'item',
      price: 0,
      image_url: getImageForCategory(item.category || 'Pantry'),
    }));
  } catch (error: any) {
    console.error('Gemini Vision Error:', error);
    const isQuota = error?.message?.includes('429') || error?.message?.includes('quota');
    Alert.alert(
      isQuota ? 'AI Quota Exceeded' : 'AI Error',
      isQuota
        ? 'Please wait a moment and try again, or check billing at console.cloud.google.com.'
        : `Could not analyze the photo. ${error?.message?.substring(0, 100) || 'Please try again.'}`,
    );
    return [];
  }
}

// ── 2. RECIPE GENERATOR ──
export async function generateRecipe(inventoryItems: string[] | any[]) {
  const ingredientList = inventoryItems.map((item: any) =>
    typeof item === 'string' ? item : `${item.quantity || 1} ${item.unit || 'item'} ${item.name}`
  ).join(', ');

  const randomSeed = Math.floor(Math.random() * 10000);

  return callGemini({
    contents: [{
      parts: [{
        text: `Random seed: ${randomSeed}. I have these ingredients: ${ingredientList}.
Create a delicious, creative recipe using mostly these ingredients (assume basic pantry staples available).
Return ONLY a JSON object with: "title" (string), "description" (string, 1 sentence), "cookTime" (string), "servings" (number), "ingredients" (array of strings), "instructions" (array of strings).
DO NOT wrap in markdown.`
      }],
    }],
    generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 4096 },
  });
}
