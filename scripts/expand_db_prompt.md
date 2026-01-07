# Prompt para expandir la Base de Datos de Alimentos

Este archivo documenta el prompt utilizado para generar la lista expandida de alimentos en `constants.ts` usando un Modelo de Lenguaje (LLM).

## Contexto
El objetivo es tener una base de datos local ("Memoria Rígida") más robusta para el sistema de Recomendación Inversa de NutriPeque AI.

## Prompt Utilizado

```text
Actúa como un Nutricionista Pediátrico experto.
Genera una lista JSON de 50 alimentos comunes y densos en nutrientes para niños de 12 a 36 meses.
La lista debe cumplir estrictamente con la interfaz TypeScript:

interface FoodItemDB {
  id: string; // único, ej "avocado_slice"
  name: string; // Nombre en Español
  category: 'protein' | 'fruit' | 'veg' | 'dairy' | 'grain' | 'fat';
  isHemeIron: boolean; // True solo para carnes/pescados
  isHighCalcium: boolean; // > 50mg/100g
  isHighVitC: boolean; // > 10mg/100g
  per100g: {
      calories: number;
      protein_g: number;
      fat_g: number;
      carbs_g: number;
      iron_mg: number;
      calcium_mg: number;
      zinc_mg: number;
      vit_d_iu: number;
      vit_c_mg: number;
  }
}

Prioriza alimentos ricos en Hierro, Calcio, Omega-3 y Zinc.
Incluye:
- 10 Proteínas (Animal/Vegetal)
- 15 Frutas
- 15 Verduras
- 5 Lácteos
- 5 Granos/Grasas

Formato de salida: Un solo array JSON [ ... ].
```

## Resultado
El resultado de este prompt se ha integrado directamente en el archivo `src/constants.ts` bajo la constante `FOOD_DATABASE`.
