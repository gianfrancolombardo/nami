import { GoogleGenAI, Type } from "@google/genai";
import { NutritionalValues } from "../types";

const PARSE_SYSTEM_INSTRUCTION = `
Eres un nutricionista pediátrico experto para la app "NutriPeque AI".
Tu objetivo es interpretar lo que comió un niño pequeño (12-36 meses) y convertirlo en JSON estructurado.
Debes ajustar el tamaño de las porciones según la edad proporcionada.
Ejemplo: "Media banana" para 14 meses -> ~40g.
Ejemplo: "Media banana" para 30 meses -> ~60g.

Retorna UN SOLO alimento que mejor coincida con la entrada en ESPAÑOL.
Si la entrada es vaga, haz una estimación conservadora.
`;

const RECOMMENDATION_SYSTEM_INSTRUCTION = `
Eres el "Motor de Recomendación Inversa" de NutriPeque AI.
Tu objetivo es sugerir alimentos específicos para cerrar brechas nutricionales.
Reglas de Sinergia: Si falta Hierro, sugiere alimentos ricos en hierro. Si sugieres hierro no hemo (lentejas), menciona combinar con Vitamina C.
Reglas de Inhibición: No sugieras mucho Calcio (Lácteos) si el objetivo principal es la absorción de hierro en esa comida.
Mantén las sugerencias amigables para niños pequeños (texturas suaves, sabores simples).
Responde SIEMPRE en Español, con un tono amable y motivador.
`;

export const parseFoodInput = async (
  inputText: string, 
  childAgeMonths: number
): Promise<{ name: string; amount_g: number; nutrients: NutritionalValues } | null> => {
  
  if (!process.env.API_KEY) {
    console.error("Falta la API Key");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Edad del niño: ${childAgeMonths} meses. Entrada: "${inputText}"`,
      config: {
        systemInstruction: PARSE_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Nombre estandarizado del alimento en Español" },
            amount_g: { type: Type.NUMBER, description: "Peso estimado en gramos" },
            nutrients: {
              type: Type.OBJECT,
              properties: {
                calories: { type: Type.NUMBER },
                protein_g: { type: Type.NUMBER },
                fat_g: { type: Type.NUMBER },
                carbs_g: { type: Type.NUMBER },
                iron_mg: { type: Type.NUMBER },
                calcium_mg: { type: Type.NUMBER },
                zinc_mg: { type: Type.NUMBER },
                vit_d_iu: { type: Type.NUMBER },
                vit_c_mg: { type: Type.NUMBER },
              }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
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
  missingNutrient: string,
  deficitAmount: number
): Promise<string> => {
   if (!process.env.API_KEY) return "Servicio de IA no disponible.";

   const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
   
   try {
     const prompt = `
     Niño: ${childName}, Edad: ${childAgeMonths} meses.
     Déficit: ${missingNutrient} por ${deficitAmount} unidades.
     Genera una mini-receta o sugerencia de una sola frase para solucionar esto ahora.
     Ejemplo: "Para el hierro, dale a Leo 30g de hígado de pollo salteado y machacado con papa."
     `;

     const response = await ai.models.generateContent({
       model: "gemini-3-flash-preview",
       contents: prompt,
       config: {
         systemInstruction: RECOMMENDATION_SYSTEM_INSTRUCTION,
         maxOutputTokens: 150,
       }
     });

     return response.text || "No se pudo generar la sugerencia.";
   } catch (e) {
     return "Consulta a tu pediatra.";
   }
};