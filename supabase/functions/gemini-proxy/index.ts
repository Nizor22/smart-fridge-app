// supabase/functions/gemini-proxy/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Helper function to safely extract and parse JSON from unsanitized Gemini REST API responses.
 * Strips markdown code blocks (e.g., ```json ... ```), trims whitespace, and handles edge cases
 * without throwing unhandled 500 errors.
 */
function extractAndParseJSON(rawText: string): any {
  if (!rawText || typeof rawText !== "string") {
    throw new Error("Empty or invalid string provided for JSON parsing");
  }

  // Trim whitespace
  let cleaned = rawText.trim();

  // Strip markdown code fences (```json ... ``` or ``` ...)
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "");
    cleaned = cleaned.replace(/\s*```$/i, "");
    cleaned = cleaned.trim();
  }

  // Try direct parse
  try {
    return JSON.parse(cleaned);
  } catch (_firstErr) {
    // Attempt regex extraction for outermost JSON object {...} or array [...]
    const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (regexErr: any) {
        throw new Error(`Failed to parse extracted JSON block: ${regexErr.message}`);
      }
    }
    throw new Error(`Response does not contain valid JSON structure: ${cleaned.substring(0, 100)}...`);
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Verify Authorization Header (JWT)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized user token" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Parse & Validate Incoming Request Payload
    const reqBody = await req.json();
    const { action, base64Image, inventoryItems, message, history } = reqBody;

    if (!GEMINI_API_KEY) {
      throw new Error("Server configuration error: GEMINI_API_KEY missing");
    }

    let promptBody: any;
    const model = "gemini-3.5-flash";

    if (action === "analyze_image") {
      if (!base64Image) {
        return new Response(JSON.stringify({ error: "Missing base64Image parameter" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      promptBody = {
        contents: [{
          parts: [
            { text: 'Identify every food item in this photo. Return a JSON object: {"items":[{"name":"...","category":"Produce|Dairy|Meat|Beverage|Pantry|Leftovers","urgency":"FRESH|EXPIRING_SOON|EXPIRED","quantity":1,"unit":"item"}]}' },
            { inlineData: { mimeType: "image/jpeg", data: base64Image } }
          ]
        }],
        generationConfig: { responseMimeType: "application/json", maxOutputTokens: 4096 }
      };
    } else if (action === "generate_recipe") {
      if (!inventoryItems || !Array.isArray(inventoryItems)) {
        return new Response(JSON.stringify({ error: "Invalid inventoryItems array" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const ingredientList = inventoryItems.map((item: any) =>
        typeof item === 'string' ? item : `${item.quantity || 1} ${item.unit || 'item'} ${item.name}`
      ).join(', ');

      promptBody = {
        contents: [{
          parts: [{
            text: `I have these ingredients: ${ingredientList}. Create a creative recipe using mostly these ingredients. Return ONLY a JSON object with: "title" (string), "description" (string, 1 sentence), "cookTime" (string), "servings" (number), "ingredients" (array of strings), "instructions" (array of strings).`
          }]
        }],
        generationConfig: { responseMimeType: "application/json", maxOutputTokens: 4096 }
      };
    } else if (action === "chat_assistant") {
      if (!message && (!history || !Array.isArray(history) || history.length === 0)) {
        return new Response(JSON.stringify({ error: "Missing message or history parameter for chat_assistant" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const inventoryContext = Array.isArray(inventoryItems) && inventoryItems.length > 0
        ? `\nCurrent fridge items: ${inventoryItems.map((item: any) => typeof item === 'string' ? item : item.name).join(', ')}`
        : '';

      const systemPrompt = `You are Smart Fridge AI Assistant, a friendly and helpful smart fridge assistant. You help users manage their food inventory, plan meals, reduce food waste, and answer cooking questions.${inventoryContext}\nReturn your response as a JSON object: {"reply": "your message string", "suggestedActions": ["action 1", "action 2"]}`;

      const contents: any[] = [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: '{"reply": "Hello! How can I help with your fridge today?", "suggestedActions": ["What can I cook?", "Check expiring items"]}' }] }
      ];

      if (Array.isArray(history)) {
        for (const msg of history) {
          contents.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: typeof msg.content === 'string' ? msg.content : (msg.text || JSON.stringify(msg)) }]
          });
        }
      }

      if (message) {
        contents.push({
          role: "user",
          parts: [{ text: message }]
        });
      }

      promptBody = {
        contents,
        generationConfig: { responseMimeType: "application/json", maxOutputTokens: 4096 }
      };
    } else {
      return new Response(JSON.stringify({ error: "Invalid action type. Supported actions: analyze_image, generate_recipe, chat_assistant" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Forward Authorized Request to Gemini REST Endpoint
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
    const geminiRes = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(promptBody),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return new Response(JSON.stringify({ error: `Gemini API error: ${geminiRes.status}`, details: errText }), {
        status: geminiRes.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return new Response(JSON.stringify({ error: "Gemini API returned an empty or invalid content payload" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let parsedJSON: any;
    try {
      parsedJSON = extractAndParseJSON(rawText);
    } catch (parseError: any) {
      // Fallback for chat_assistant if raw text was returned without JSON wrapper
      if (action === "chat_assistant") {
        parsedJSON = { reply: rawText.trim(), suggestedActions: [] };
      } else {
        return new Response(JSON.stringify({ error: `JSON Parse Error: ${parseError.message}`, rawText }), {
          status: 422,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ success: true, data: parsedJSON }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
