const GEMINI_API_KEY = 'AQ.Ab8RN6JtyceEfKyrBuYpYQHbIiD6XxMNAmplztIEAdivpPAkhA';
const MODEL = 'gemini-2.5-flash';

export async function analyzeFridgeImage(base64Image: string) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: "Analyze this image of food items. Identify ALL visible food items. Return ONLY a JSON array of objects, each with: 'name' (string), 'category' (one of: 'Dairy', 'Produce', 'Meat', 'Pantry', 'Beverage', 'Other'), 'urgency' (one of: 'EAT_NOW' if expires within 2 days, 'USE_SOON' if 3-5 days, 'FRESH' if >5 days), 'price' (number, estimate). DO NOT WRAP IN MARKDOWN." },
          { inlineData: { mimeType: "image/jpeg", data: base64Image } }
        ]
      }],
      generationConfig: { responseMimeType: "application/json" }
    })
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`API ${response.status}: ${errBody.substring(0, 200)}`);
  }

  const data = await response.json();
  const parsed = JSON.parse(data.candidates[0].content.parts[0].text);
  return Array.isArray(parsed) ? parsed : [parsed];
}

export async function generateRecipe(inventory: any[]) {
  const inventoryList = inventory.map(i => i.name).join(', ');
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `I have these ingredients: ${inventoryList}. Generate a simple, senior-friendly, zero-waste recipe. Return ONLY a JSON object with: 'title' (string), 'description' (string, 1 sentence), 'cookTime' (string), 'servings' (number), 'ingredients' (array of strings), 'instructions' (array of strings). DO NOT WRAP IN MARKDOWN.`
        }]
      }],
      generationConfig: { responseMimeType: "application/json" }
    })
  });

  if (!response.ok) throw new Error(`API ${response.status}`);
  const data = await response.json();
  return JSON.parse(data.candidates[0].content.parts[0].text);
}
