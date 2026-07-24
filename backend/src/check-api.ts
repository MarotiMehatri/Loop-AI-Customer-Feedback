import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

async function checkGemini(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const model =
    process.env.GEMINI_MODEL?.trim() ||
    "gemini-2.5-flash";

  if (!apiKey) {
    console.error("GEMINI_API_KEY is missing from .env");
    process.exitCode = 1;
    return;
  }

  console.log("API key loaded:", true);
  console.log("Model:", model);

  const ai = new GoogleGenAI({
    apiKey,
  });

  try {
    const response = await ai.models.generateContent({
      model,
      contents: "Reply only with: Gemini API working",
    });

    console.log("Gemini response:", response.text);
  } catch (error) {
    console.error("Gemini API test failed:", error);
    process.exitCode = 1;
  }
}

void checkGemini();