import { GoogleGenAI } from "@google/genai";
import { NutritionalValues } from "../types";
import { PARSE_SYSTEM_INSTRUCTION, RECIPE_SYSTEM_INSTRUCTION, ROADMAP_SYSTEM_INSTRUCTION } from './prompts';

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
    const prompt = `Analiza esta entrada: "${inputText}"\nEdad: ${childAgeMonths} meses.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      systemInstruction: PARSE_SYSTEM_INSTRUCTION,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text);
      return Array.isArray(parsed) ? parsed : [parsed];
    }
    return null;
  } catch (error) {
    console.error("Gemini Parse Error:", error);
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
    const dataString = ingredientsData.map(d => `${d.name} (${d.nutrient}: +${d.amount})`).join(", ");
    const prompt = `Niño: ${childName}, Edad: ${childAgeMonths} meses.
Datos de alimentos y huecos: ${dataString}.
Crea la propuesta directa.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      systemInstruction: RECIPE_SYSTEM_INSTRUCTION,
      contents: prompt,
      config: {
        maxOutputTokens: 250,
      }
    });

    return response.text || "No se pudo generar.";
  } catch (e) {
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
    const prompt = `Analiza estos huecos para ${childName} (${ageMonths} meses): ${JSON.stringify(gaps)}.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      systemInstruction: ROADMAP_SYSTEM_INSTRUCTION,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    return response.text ? JSON.parse(response.text) : null;
  } catch (error) {
    console.error("Gemini Roadmap Error:", error);
    return null;
  }
};