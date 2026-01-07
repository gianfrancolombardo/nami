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
    if (hasOpenAI()) return getRoadmapOpenAI(childName, ageMonths, gaps);
    if (hasGemini()) return getRoadmapGemini(childName, ageMonths, gaps);
    return null;
};
