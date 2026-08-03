const GEMINI_API_KEY = 'AQ.Ab8RN6JtyceEfKyrBuYpYQHbIiD6XxMNAmplztIEAdivpPAkhA';

export async function analyzeFridgeImage(base64Image: string) {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "Analyze this image of food or a grocery receipt. Identify the single most prominent food item. Return ONLY a JSON object with exactly these fields: 'name' (string, the food name), 'category' (string, one of: 'Dairy', 'Produce', 'Meat', 'Pantry', 'Other'), 'urgency' (string, one of: 'EAT_NOW' if it expires within 2 days, 'USE_SOON' if 3-5 days, 'FRESH' if >5 days), 'price' (number, estimate if not visible). DO NOT WRAP IN MARKDOWN BLOCKS."
              },
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: base64Image
                }
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json",
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    const resultText = data.candidates[0].content.parts[0].text;
    
    // Parse the JSON string from Gemini
    return JSON.parse(resultText);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}

export async function generateRecipe(inventory: any[]) {
  try {
    const inventoryList = inventory.map(i => i.name).join(', ');
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `I have these ingredients in my fridge: ${inventoryList}. Generate a simple, senior-friendly, zero-waste recipe using some of these ingredients. Return ONLY a JSON object with: 'title' (string), 'ingredients' (array of strings), 'instructions' (array of strings). DO NOT WRAP IN MARKDOWN BLOCKS.`
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json",
        }
      })
    });

    if (!response.ok) throw new Error(`API Error: ${response.status}`);

    const data = await response.json();
    const resultText = data.candidates[0].content.parts[0].text;
    return JSON.parse(resultText);
  } catch (error) {
    console.error("Gemini Recipe Error:", error);
    throw error;
  }
}
