import { parseFoodInput as parseGemini, getSmartRecipe as getRecipeGemini, getNutritionalRoadmap as getRoadmapGemini } from './geminiService';
import { parseFoodInput as parseOpenAI, getSmartRecipe as getRecipeOpenAI, getNutritionalRoadmap as getRoadmapOpenAI } from './openaiService';

const hasOpenAI = () => {
    const key = import.meta.env.VITE_OPENAI_API_KEY;
    return key && !key.includes('PLACEHOLDER') && key.length > 20;
};

const hasGemini = () => {
    const key = import.meta.env.VITE_GEMINI_API_KEY;
    return key && !key.includes('PLACEHOLDER') && key.length > 20;
};

export const parseFoodInput = async (inputText: string, childAgeMonths: number) => {
    if (hasOpenAI()) {
        console.log("AI Manager: Using OpenAI Parse");
        return parseOpenAI(inputText, childAgeMonths);
    }
    if (hasGemini()) {
        console.log("AI Manager: Using Gemini Parse");
        return parseGemini(inputText, childAgeMonths);
    }
    return null;
};

export const parseFoodImage = async (imageBase64: string, childAgeMonths: number) => {
    // Only Gemini supports vision in this setup for now
    if (hasGemini()) {
        console.log("AI Manager: Using Gemini Vision");
        // @ts-ignore
        return import('./geminiService').then(m => m.parseFoodImage(imageBase64, childAgeMonths));
    }
    console.warn("AI Manager: No Vision capable model enabled.");
    return null;
};

export const getSmartRecipe = async (
    childName: string,
    childAgeMonths: number,
    ingredientsData: { name: string; nutrient: string; amount: number }[]
) => {
    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (geminiKey && !geminiKey.includes('PLACEHOLDER')) {
        return getRecipeGemini(childName, childAgeMonths, ingredientsData);
    }

    return getRecipeOpenAI(childName, childAgeMonths, ingredientsData);
};

export const getNutritionalRoadmap = async (
    childName: string,
    ageMonths: number,
    gaps: { nutrient: string; amount: number }[]
) => {
    if (hasGemini()) return getRoadmapGemini(childName, ageMonths, gaps);
    return null;
};

export const getHistoryAnalysis = async (
    childName: string,
    ageMonths: number,
    aggregatedData: any
) => {
    // Only Gemini supports this for now
    if (hasGemini()) {
        // @ts-ignore
        return import('./geminiService').then(m => m.getHistoryAnalysis(childName, ageMonths, aggregatedData));
    }
    return null;
};
