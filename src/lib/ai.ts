const GEMINI_API_KEY = 'AQ.Ab8RN6JtyceEfKyrBuYpYQHbIiD6XxMNAmplztIEAdivpPAkhA';
const MODELS = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'];

async function callGemini(body: object, retries = 0): Promise<any> {
  const model = MODELS[Math.min(retries, MODELS.length - 1)];
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (response.status === 503 || response.status === 429) {
    if (retries < MODELS.length - 1) {
      await new Promise(r => setTimeout(r, 1000 * (retries + 1)));
      return callGemini(body, retries + 1);
    }
  }

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`API ${response.status}: ${errBody.substring(0, 200)}`);
  }

  const data = await response.json();
  return JSON.parse(data.candidates[0].content.parts[0].text);
}

const CATEGORY_IMAGES: Record<string, string> = {
  Dairy: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=100&h=100&fit=crop&auto=format',
  Produce: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100&h=100&fit=crop&auto=format',
  Meat: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=100&h=100&fit=crop&auto=format',
  Pantry: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=100&h=100&fit=crop&auto=format',
  Beverage: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=100&h=100&fit=crop&auto=format',
  Other: 'https://images.unsplash.com/photo-1506354666786-959d6d497f1a?w=100&h=100&fit=crop&auto=format',
};

export function getImageForCategory(category: string): string {
  return CATEGORY_IMAGES[category] || CATEGORY_IMAGES.Other;
}

export async function analyzeFridgeImage(base64Image: string) {
  const result = await callGemini({
    contents: [{
      parts: [
        { text: "Analyze this image of food items. Identify ALL visible food items. Return ONLY a JSON array of objects, each with: 'name' (string), 'category' (one of: 'Dairy', 'Produce', 'Meat', 'Pantry', 'Beverage', 'Other'), 'urgency' (one of: 'EAT_NOW' if expires within 2 days, 'USE_SOON' if 3-5 days, 'FRESH' if >5 days), 'price' (number, estimate). DO NOT WRAP IN MARKDOWN." },
        { inlineData: { mimeType: "image/jpeg", data: base64Image } }
      ]
    }],
    generationConfig: { responseMimeType: "application/json" }
  });
  const items = Array.isArray(result) ? result : [result];
  return items.map((item: any) => ({
    ...item,
    image_url: getImageForCategory(item.category || 'Other'),
  }));
}

export async function generateRecipe(inventory: any[]) {
  const inventoryList = inventory.map(i => i.name).join(', ');
  const randomSeed = Math.floor(Math.random() * 10000);
  return callGemini({
    contents: [{
      parts: [{
        text: `Random seed: ${randomSeed}. I have these ingredients: ${inventoryList}. Generate a UNIQUE, creative, senior-friendly, zero-waste recipe using some of these ingredients. Be creative and varied. Return ONLY a JSON object with: 'title' (string), 'description' (string, 1 sentence), 'cookTime' (string), 'servings' (number), 'ingredients' (array of strings), 'instructions' (array of strings). DO NOT WRAP IN MARKDOWN.`
      }]
    }],
    generationConfig: { responseMimeType: "application/json", temperature: 1.2 }
  });
}
