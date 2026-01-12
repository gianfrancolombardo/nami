import OpenAI from 'openai';
import { NutritionalValues } from "../types";
import {
    PARSE_SYSTEM_INSTRUCTION,
    RECIPE_SYSTEM_INSTRUCTION,
    ROADMAP_SYSTEM_INSTRUCTION,
    generateParsePrompt,
    generateRecipePrompt,
    generateRoadmapPrompt
} from "./prompts";

interface ParsedFood {
    name: string;
    amount_g: number;
    nutrients: NutritionalValues;
}

const getClient = () => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey || apiKey.includes('PLACEHOLDER')) return null;
    return new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
    });
};

export const parseFoodInput = async (
    inputText: string,
    childAgeMonths: number
): Promise<ParsedFood[] | null> => {
    const openai = getClient();
    if (!openai) return null;

    const model = import.meta.env.VITE_OPENAI_MODEL || "gpt-4o-mini";

    try {
        const response = await openai.chat.completions.create({
            model: model,
            messages: [
                { role: "system", content: PARSE_SYSTEM_INSTRUCTION },
                { role: "user", content: generateParsePrompt(inputText, childAgeMonths) }
            ],
            response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content;
        if (content) {
            const parsed = JSON.parse(content);
            if (Array.isArray(parsed)) return parsed;
            if (parsed.items && Array.isArray(parsed.items)) return parsed.items;
            return [parsed];
        }
        return null;
    } catch (error) {
        console.error("OpenAI Parse Error:", error);
        return null;
    }
};

export const getSmartRecipe = async (
    childName: string,
    childAgeMonths: number,
    ingredientsData: { name: string; nutrient: string; amount: number }[]
): Promise<string> => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey || apiKey.includes('PLACEHOLDER')) return "Servicio no disponible.";

    const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

    try {
        const prompt = generateRecipePrompt(childName, childAgeMonths, ingredientsData);

        const model = import.meta.env.VITE_OPENAI_MODEL || "gpt-4o-mini";

        const completion = await openai.chat.completions.create({
            model: model,
            messages: [
                { role: "system", content: RECIPE_SYSTEM_INSTRUCTION },
                { role: "user", content: prompt },
            ],
            max_tokens: 300,
        });

        return completion.choices[0].message?.content || "No se pudo generar.";
    } catch (e) {
        return "Error en receta.";
    }
};

export const getNutritionalRoadmap = async (
    childName: string,
    ageMonths: number,
    gaps: { nutrient: string; amount: number }[]
): Promise<any> => {
    const openai = getClient();
    if (!openai) return null;

    try {
        const model = import.meta.env.VITE_OPENAI_MODEL || "gpt-4o-mini";
        const response = await openai.chat.completions.create({
            model: model,
            messages: [
                { role: "system", content: ROADMAP_SYSTEM_INSTRUCTION },
                { role: "user", content: generateRoadmapPrompt(childName, ageMonths, gaps) }
            ],
            response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content;
        return content ? JSON.parse(content) : null;
    } catch (error) {
        console.error("OpenAI Roadmap Error:", error);
        return null;
    }
};
