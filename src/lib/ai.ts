import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { Alert } from 'react-native';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY!;
if (!GEMINI_API_KEY) console.warn('EXPO_PUBLIC_GEMINI_API_KEY is not set in .env');

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// ── Category images for items without a product photo ──
const CATEGORY_IMAGES: Record<string, string> = {
  Produce: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&q=80',
  Dairy: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80',
  Meat: 'https://images.unsplash.com/photo-1607623814075-e51df1bd682f?w=400&q=80',
  Beverage: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80',
  Pantry: 'https://images.unsplash.com/photo-1584313203487-75e9f8db1127?w=400&q=80',
  Leftovers: 'https://images.unsplash.com/photo-1621317676644-8848db2c3f87?w=400&q=80',
  Other: 'https://images.unsplash.com/photo-1506354666786-959d6d497f1a?w=100&h=100&fit=crop&auto=format',
};

export function getImageForCategory(category: string): string {
  return CATEGORY_IMAGES[category] || CATEGORY_IMAGES.Other;
}

// ── 1. VISION SCANNER (Structured Output) ──
// Uses responseSchema to mathematically guarantee valid categories/urgencies
// that match the Postgres CHECK constraints — no hallucinated values possible
export async function analyzeFridgeImage(base64Image: string) {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            items: {
              type: SchemaType.ARRAY,
              description: 'List of distinct grocery items found in the image',
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  name: { type: SchemaType.STRING, description: 'Short, clear product name' },
                  category: {
                    type: SchemaType.STRING,
                    enum: ['Produce', 'Dairy', 'Meat', 'Beverage', 'Pantry', 'Leftovers'],
                  },
                  urgency: {
                    type: SchemaType.STRING,
                    enum: ['FRESH', 'EXPIRING_SOON', 'EXPIRED'],
                  },
                  quantity: { type: SchemaType.NUMBER, description: 'Count of this item' },
                  unit: { type: SchemaType.STRING, description: 'Unit (item, lb, gallon, etc.)' },
                },
                required: ['name', 'category', 'urgency', 'quantity', 'unit'],
              },
            },
          },
          required: ['items'],
        },
      },
    });

    const prompt = 'You are an AI Smart Fridge assistant. Analyze this image of groceries. Identify all distinct grocery items you can see. Return data adhering strictly to the JSON schema.';
    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
    ]);

    const responseText = result.response.text();
    if (!responseText) throw new Error('No response from AI');

    const parsed = JSON.parse(responseText);
    return (parsed.items || []).map((item: any) => ({
      name: item.name || 'Unknown Item',
      category: item.category || 'Pantry',
      urgency: item.urgency || 'FRESH',
      quantity: Number(item.quantity) || 1,
      unit: item.unit || 'item',
      price: 0,
      image_url: getImageForCategory(item.category),
    }));
  } catch (error) {
    console.error('Gemini Vision Error:', error);
    Alert.alert('AI Error', 'Could not analyze the photo. Please try again.');
    return [];
  }
}

// ── 2. RECIPE GENERATOR (Structured Output) ──
// Accepts compressed string[] like ["2 item Apple", "1 gallon Milk"] to save tokens
export async function generateRecipe(inventoryItems: string[] | any[]) {
  try {
    // Handle both string arrays and full objects (backward compat)
    const ingredientList = inventoryItems.map((item: any) =>
      typeof item === 'string' ? item : `${item.quantity || 1} ${item.unit || 'item'} ${item.name}`
    ).join(', ');

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 1.2,
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            title: { type: SchemaType.STRING },
            description: { type: SchemaType.STRING },
            cookTime: { type: SchemaType.STRING },
            servings: { type: SchemaType.NUMBER },
            ingredients: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            instructions: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          },
          required: ['title', 'description', 'cookTime', 'servings', 'ingredients', 'instructions'],
        },
      },
    });

    const randomSeed = Math.floor(Math.random() * 10000);
    const prompt = `Random seed: ${randomSeed}. I have these ingredients in my fridge: ${ingredientList}. Create a delicious, creative recipe using mostly these ingredients (assume basic pantry staples like salt, oil, pepper are available). Be unique and varied — do not repeat common recipes.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    if (!responseText) throw new Error('No response from AI');

    return JSON.parse(responseText);
  } catch (error) {
    console.error('Recipe Gen Error:', error);
    throw new Error('Failed to generate recipe');
  }
}
