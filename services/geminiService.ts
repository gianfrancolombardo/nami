
import { GoogleGenAI } from "@google/genai";
import { NutritionalValues } from "../types";
import {
  generateParsePrompt,
  generateImageParsePrompt,
  generateRecipePrompt,
  generateRoadmapPrompt,
  generateHistoryAnalysisPrompt
} from './prompts';

interface ParsedFood {
  name: string;
  amount_g: number;
  nutrients: NutritionalValues;
}

export const parseFoodInput = async (
  inputText: string,
  childAgeMonths: number
): Promise<ParsedFood[] | null> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey.includes('PLACEHOLDER')) return null;

  const ai = new GoogleGenAI({ apiKey });

  try {
    const prompt = generateParsePrompt(inputText, childAgeMonths);
    const model = import.meta.env.VITE_GEMINI_MODEL || "gemini-1.5-flash";
    console.log("[Gemini] Sending Parse Prompt Length:", prompt.length);
    console.log(`[Gemini] Using model: ${model}`);

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    console.log("[Gemini] Parse Response received");
    console.log("[Gemini] Parse Response Text:", response.text);

    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text);
      return Array.isArray(parsed) ? parsed : [parsed];
    }
    return null;
  } catch (error) {
    console.error("Gemini Parse Error - Full Details:", error);
    if (error instanceof Error) {
      console.error("Error Message:", error.message);
      console.error("Error Stack:", error.stack);
    }
    return null;
  }
};

export const parseFoodImage = async (
  imageBase64: string,
  childAgeMonths: number
): Promise<ParsedFood[] | null> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey.includes('PLACEHOLDER')) return null;

  const ai = new GoogleGenAI({ apiKey });

  try {
    // Clean base64 string if it contains data prefix
    const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const prompt = generateImageParsePrompt(childAgeMonths);
    const model = import.meta.env.VITE_GEMINI_MODEL || "gemini-1.5-flash"; // Flash 1.5 supports vision

    console.log("[Gemini] Sending Vision Request");

    const response = await ai.models.generateContent({
      model: model,
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg", // Assuming jpg/jpeg for simplicity, or we could detect
                data: cleanBase64
              }
            }
          ]
        }
      ],
      config: { responseMimeType: "application/json" }
    });
    console.log("[Gemini] Vision Response received");
    console.log("[Gemini] Vision Response Text:", response.text);

    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text);
      return Array.isArray(parsed) ? parsed : [parsed];
    }
    return null;
  } catch (e) {
    console.error("Gemini Vision Error:", e);
    return null;
  }
};

export const getSmartRecipe = async (
  childName: string,
  childAgeMonths: number,
  ingredientsData: { name: string; nutrient: string; amount: number }[]
): Promise<string> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return "Servicio no disponible.";

  const ai = new GoogleGenAI({ apiKey });

  try {
    const prompt = generateRecipePrompt(childName, childAgeMonths, ingredientsData);
    const model = import.meta.env.VITE_GEMINI_MODEL || "gemini-1.5-flash";

    console.log("[Gemini] Sending Recipe Prompt Length:", prompt.length);

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        maxOutputTokens: 250,
      }
    });
    console.log("[Gemini] Recipe Response received");
    console.log("[Gemini] Recipe Response Text:", response.text);

    return response.text || "No se pudo generar.";
  } catch (e) {
    console.error("Gemini Recipe Error:", e);
    return "Error en receta.";
  }
};

export const getNutritionalRoadmap = async (
  childName: string,
  ageMonths: number,
  gaps: { nutrient: string; amount: number }[]
): Promise<any> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return null;

  const ai = new GoogleGenAI({ apiKey });

  try {
    const prompt = generateRoadmapPrompt(childName, ageMonths, gaps);
    const model = import.meta.env.VITE_GEMINI_MODEL || "gemini-1.5-flash";

    console.log("[Gemini] Sending Roadmap Prompt Length:", prompt.length);
    console.log(`[Gemini] Using model: ${model}`);

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    console.log("[Gemini] Roadmap Response received");
    console.log("[Gemini] Roadmap Response Text:", response.text);

    return response.text ? JSON.parse(response.text) : null;
  } catch (error) {
    console.error("Gemini Roadmap Error:", error);
    return null;
  }
};

export const getHistoryAnalysis = async (
  childName: string,
  ageMonths: number,
  aggregatedData: any
): Promise<any> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return null;

  const ai = new GoogleGenAI({ apiKey });

  try {
    const prompt = generateHistoryAnalysisPrompt(childName, ageMonths, aggregatedData);
    const model = import.meta.env.VITE_GEMINI_MODEL || "gemini-1.5-flash";

    console.log("[Gemini] Sending History Analysis Prompt");

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    return response.text ? JSON.parse(response.text) : null;
  } catch (error) {
    console.error("Gemini History Analysis Error:", error);
    return null;
  }
};
