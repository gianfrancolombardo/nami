import { FoodItemDB, NutritionalValues, DailyTargets } from './types';

// --- Logic Helpers ---

export const calculateAgeInMonths = (birthDate: string): number => {
  const birth = new Date(birthDate);
  const now = new Date();
  let months = (now.getFullYear() - birth.getFullYear()) * 12;
  months -= birth.getMonth();
  months += now.getMonth();
  return months <= 0 ? 0 : months;
};

export const calculateTargets = (ageMonths: number, weightKg: number): DailyTargets => {
  const isOlderToddler = ageMonths > 24;

  return {
    calories: isOlderToddler ? 1100 : 800,
    protein_g: Math.round(weightKg * 1.1),
    fat_g: isOlderToddler ? 40 : 30,
    carbs_g: isOlderToddler ? 130 : 95,
    iron_mg: 7,
    calcium_mg: 700,
    zinc_mg: 3,
    vit_d_iu: 600,
    vit_c_mg: 15,
  };
};

export const EMPTY_STATS: NutritionalValues = {
  calories: 0, protein_g: 0, fat_g: 0, carbs_g: 0,
  iron_mg: 0, calcium_mg: 0, zinc_mg: 0, vit_d_iu: 0, vit_c_mg: 0
};

// --- Base de Datos "Memoria Rígida" Expandida (50+ Alimentos) ---
export const FOOD_DATABASE: FoodItemDB[] = [
  // --- PROTEÍNAS (Animal y Vegetal) ---
  { id: 'beef_liver', name: 'Hígado de Res (Cocido)', category: 'protein', isHemeIron: true, isHighCalcium: false, isHighVitC: false, isPlantBased: false, per100g: { calories: 191, protein_g: 29.1, fat_g: 5.3, carbs_g: 5.1, iron_mg: 6.5, calcium_mg: 6, zinc_mg: 5.3, vit_d_iu: 1.2, vit_c_mg: 1.3 } },
  { id: 'chicken_liver', name: 'Hígado de Pollo (Cocido)', category: 'protein', isHemeIron: true, isHighCalcium: false, isHighVitC: true, isPlantBased: false, per100g: { calories: 167, protein_g: 24.5, fat_g: 6.5, carbs_g: 0.9, iron_mg: 11.6, calcium_mg: 8, zinc_mg: 4, vit_d_iu: 0, vit_c_mg: 18 } },
  { id: 'ground_beef_lean', name: 'Carne Molida Magra', category: 'protein', isHemeIron: true, isHighCalcium: false, isHighVitC: false, isPlantBased: false, per100g: { calories: 250, protein_g: 26, fat_g: 15, carbs_g: 0, iron_mg: 2.6, calcium_mg: 18, zinc_mg: 6.3, vit_d_iu: 0, vit_c_mg: 0 } },
  { id: 'salmon', name: 'Salmón Atlántico', category: 'protein', isHemeIron: true, isHighCalcium: false, isHighVitC: false, isPlantBased: false, per100g: { calories: 206, protein_g: 22, fat_g: 13, carbs_g: 0, iron_mg: 0.8, calcium_mg: 15, zinc_mg: 0.6, vit_d_iu: 526, vit_c_mg: 0 } },
  { id: 'egg_whole', name: 'Huevo Entero (Cocido)', category: 'protein', isHemeIron: true, isHighCalcium: true, isHighVitC: false, isPlantBased: false, per100g: { calories: 155, protein_g: 13, fat_g: 11, carbs_g: 1.1, iron_mg: 1.2, calcium_mg: 50, zinc_mg: 1.1, vit_d_iu: 87, vit_c_mg: 0 } },
  { id: 'lentils', name: 'Lentejas (Cocidas)', category: 'protein', isHemeIron: false, isHighCalcium: false, isHighVitC: false, isPlantBased: true, per100g: { calories: 116, protein_g: 9, fat_g: 0.4, carbs_g: 20, iron_mg: 3.3, calcium_mg: 19, zinc_mg: 1.3, vit_d_iu: 0, vit_c_mg: 1.5 } },
  { id: 'chickpeas', name: 'Garbanzos (Cocidos)', category: 'protein', isHemeIron: false, isHighCalcium: true, isHighVitC: false, isPlantBased: true, per100g: { calories: 164, protein_g: 8.9, fat_g: 2.6, carbs_g: 27, iron_mg: 2.9, calcium_mg: 49, zinc_mg: 1.5, vit_d_iu: 0, vit_c_mg: 1.3 } },
  { id: 'black_beans', name: 'Frijoles Negros', category: 'protein', isHemeIron: false, isHighCalcium: true, isHighVitC: false, isPlantBased: true, per100g: { calories: 132, protein_g: 8.9, fat_g: 0.5, carbs_g: 23.7, iron_mg: 2.1, calcium_mg: 27, zinc_mg: 1.1, vit_d_iu: 0, vit_c_mg: 0 } },
  { id: 'tofu_firm', name: 'Tofu Firme (Fortificado)', category: 'protein', isHemeIron: false, isHighCalcium: true, isHighVitC: false, isPlantBased: true, per100g: { calories: 144, protein_g: 17, fat_g: 8.7, carbs_g: 2.8, iron_mg: 2.7, calcium_mg: 683, zinc_mg: 1.6, vit_d_iu: 0, vit_c_mg: 0 } },
  { id: 'chicken_breast', name: 'Pechuga de Pollo', category: 'protein', isHemeIron: true, isHighCalcium: false, isHighVitC: false, isPlantBased: false, per100g: { calories: 165, protein_g: 31, fat_g: 3.6, carbs_g: 0, iron_mg: 1, calcium_mg: 15, zinc_mg: 1, vit_d_iu: 0, vit_c_mg: 0 } },

  // --- FRUTAS (Vit C y Fibra) ---
  { id: 'orange', name: 'Naranja', category: 'fruit', isHemeIron: false, isHighCalcium: true, isHighVitC: true, isPlantBased: true, per100g: { calories: 47, protein_g: 0.9, fat_g: 0.1, carbs_g: 12, iron_mg: 0.1, calcium_mg: 40, zinc_mg: 0.1, vit_d_iu: 0, vit_c_mg: 53.2 } },
  { id: 'kiwi', name: 'Kiwi', category: 'fruit', isHemeIron: false, isHighCalcium: true, isHighVitC: true, isPlantBased: true, per100g: { calories: 61, protein_g: 1.1, fat_g: 0.5, carbs_g: 15, iron_mg: 0.3, calcium_mg: 34, zinc_mg: 0.1, vit_d_iu: 0, vit_c_mg: 92.7 } },
  { id: 'strawberries', name: 'Fresas', category: 'fruit', isHemeIron: false, isHighCalcium: false, isHighVitC: true, isPlantBased: true, per100g: { calories: 32, protein_g: 0.7, fat_g: 0.3, carbs_g: 7.7, iron_mg: 0.4, calcium_mg: 16, zinc_mg: 0.1, vit_d_iu: 0, vit_c_mg: 58.8 } },
  { id: 'papaya', name: 'Papaya', category: 'fruit', isHemeIron: false, isHighCalcium: true, isHighVitC: true, isPlantBased: true, per100g: { calories: 43, protein_g: 0.5, fat_g: 0.3, carbs_g: 11, iron_mg: 0.3, calcium_mg: 20, zinc_mg: 0.1, vit_d_iu: 0, vit_c_mg: 60.9 } },
  { id: 'mango', name: 'Mango', category: 'fruit', isHemeIron: false, isHighCalcium: false, isHighVitC: true, isPlantBased: true, per100g: { calories: 60, protein_g: 0.8, fat_g: 0.4, carbs_g: 15, iron_mg: 0.2, calcium_mg: 11, zinc_mg: 0.1, vit_d_iu: 0, vit_c_mg: 36.4 } },
  { id: 'banana', name: 'Plátano (Banana)', category: 'fruit', isHemeIron: false, isHighCalcium: false, isHighVitC: false, isPlantBased: true, per100g: { calories: 89, protein_g: 1.1, fat_g: 0.3, carbs_g: 22.8, iron_mg: 0.3, calcium_mg: 5, zinc_mg: 0.2, vit_d_iu: 0, vit_c_mg: 8.7 } },
  { id: 'avocado', name: 'Aguacate', category: 'fruit', isHemeIron: false, isHighCalcium: false, isHighVitC: false, isPlantBased: true, per100g: { calories: 160, protein_g: 2, fat_g: 14.7, carbs_g: 8.5, iron_mg: 0.6, calcium_mg: 12, zinc_mg: 0.6, vit_d_iu: 0, vit_c_mg: 10 } },
  { id: 'blueberries', name: 'Arándanos Azules', category: 'fruit', isHemeIron: false, isHighCalcium: false, isHighVitC: false, isPlantBased: true, per100g: { calories: 57, protein_g: 0.7, fat_g: 0.3, carbs_g: 14, iron_mg: 0.3, calcium_mg: 6, zinc_mg: 0.2, vit_d_iu: 0, vit_c_mg: 9.7 } },
  { id: 'cantaloupe', name: 'Melón Cantalupo', category: 'fruit', isHemeIron: false, isHighCalcium: false, isHighVitC: true, isPlantBased: true, per100g: { calories: 34, protein_g: 0.8, fat_g: 0.2, carbs_g: 8.2, iron_mg: 0.2, calcium_mg: 9, zinc_mg: 0.2, vit_d_iu: 0, vit_c_mg: 36.7 } },
  { id: 'watermelon', name: 'Sandía', category: 'fruit', isHemeIron: false, isHighCalcium: false, isHighVitC: false, isPlantBased: true, per100g: { calories: 30, protein_g: 0.6, fat_g: 0.2, carbs_g: 7.6, iron_mg: 0.2, calcium_mg: 7, zinc_mg: 0.1, vit_d_iu: 0, vit_c_mg: 8.1 } },
  { id: 'apple', name: 'Manzana (con piel)', category: 'fruit', isHemeIron: false, isHighCalcium: false, isHighVitC: false, isPlantBased: true, per100g: { calories: 52, protein_g: 0.3, fat_g: 0.2, carbs_g: 13.8, iron_mg: 0.1, calcium_mg: 6, zinc_mg: 0, vit_d_iu: 0, vit_c_mg: 4.6 } },
  { id: 'pear', name: 'Pera', category: 'fruit', isHemeIron: false, isHighCalcium: false, isHighVitC: false, isPlantBased: true, per100g: { calories: 57, protein_g: 0.4, fat_g: 0.1, carbs_g: 15, iron_mg: 0.2, calcium_mg: 9, zinc_mg: 0.1, vit_d_iu: 0, vit_c_mg: 4.3 } },
  { id: 'peach', name: 'Durazno', category: 'fruit', isHemeIron: false, isHighCalcium: false, isHighVitC: false, isPlantBased: true, per100g: { calories: 39, protein_g: 0.9, fat_g: 0.3, carbs_g: 9.5, iron_mg: 0.3, calcium_mg: 6, zinc_mg: 0.2, vit_d_iu: 0, vit_c_mg: 6.6 } },
  { id: 'grapes', name: 'Uvas', category: 'fruit', isHemeIron: false, isHighCalcium: false, isHighVitC: false, isPlantBased: true, per100g: { calories: 69, protein_g: 0.7, fat_g: 0.2, carbs_g: 18, iron_mg: 0.4, calcium_mg: 10, zinc_mg: 0.1, vit_d_iu: 0, vit_c_mg: 3.2 } },
  { id: 'pineapple', name: 'Piña', category: 'fruit', isHemeIron: false, isHighCalcium: false, isHighVitC: true, isPlantBased: true, per100g: { calories: 50, protein_g: 0.5, fat_g: 0.1, carbs_g: 13, iron_mg: 0.3, calcium_mg: 13, zinc_mg: 0.1, vit_d_iu: 0, vit_c_mg: 47.8 } },

  // --- VERDURAS (Micros) ---
  { id: 'spinach_cooked', name: 'Espinacas Cocidas', category: 'veg', isHemeIron: false, isHighCalcium: true, isHighVitC: false, isPlantBased: true, per100g: { calories: 23, protein_g: 3, fat_g: 0.3, carbs_g: 3.8, iron_mg: 3.6, calcium_mg: 136, zinc_mg: 0.5, vit_d_iu: 0, vit_c_mg: 9.8 } },
  { id: 'broccoli', name: 'Brócoli (Cocido)', category: 'veg', isHemeIron: false, isHighCalcium: true, isHighVitC: true, isPlantBased: true, per100g: { calories: 35, protein_g: 2.4, fat_g: 0.4, carbs_g: 7.2, iron_mg: 0.7, calcium_mg: 40, zinc_mg: 0.4, vit_d_iu: 0, vit_c_mg: 64.9 } },
  { id: 'sweet_potato', name: 'Camote/Batata (Cocido)', category: 'veg', isHemeIron: false, isHighCalcium: true, isHighVitC: false, isPlantBased: true, per100g: { calories: 76, protein_g: 1.4, fat_g: 0.1, carbs_g: 17.7, iron_mg: 0.7, calcium_mg: 27, zinc_mg: 0.3, vit_d_iu: 0, vit_c_mg: 12.8 } },
  { id: 'carrot', name: 'Zanahoria (Cocida)', category: 'veg', isHemeIron: false, isHighCalcium: true, isHighVitC: false, isPlantBased: true, per100g: { calories: 35, protein_g: 0.8, fat_g: 0.2, carbs_g: 8.2, iron_mg: 0.3, calcium_mg: 30, zinc_mg: 0.2, vit_d_iu: 0, vit_c_mg: 3.6 } },
  { id: 'peas', name: 'Guisantes/Chícharos', category: 'veg', isHemeIron: false, isHighCalcium: true, isHighVitC: false, isPlantBased: true, per100g: { calories: 84, protein_g: 5.4, fat_g: 0.2, carbs_g: 15.6, iron_mg: 1.5, calcium_mg: 27, zinc_mg: 1.2, vit_d_iu: 0, vit_c_mg: 14.2 } },
  { id: 'kale', name: 'Kale (Cocido)', category: 'veg', isHemeIron: false, isHighCalcium: true, isHighVitC: true, isPlantBased: true, per100g: { calories: 28, protein_g: 1.9, fat_g: 0.4, carbs_g: 5.6, iron_mg: 1.2, calcium_mg: 72, zinc_mg: 0.2, vit_d_iu: 0, vit_c_mg: 41 } },
  { id: 'pumpkin', name: 'Calabaza (Cocida)', category: 'veg', isHemeIron: false, isHighCalcium: true, isHighVitC: false, isPlantBased: true, per100g: { calories: 20, protein_g: 0.7, fat_g: 0.1, carbs_g: 4.9, iron_mg: 0.6, calcium_mg: 15, zinc_mg: 0.2, vit_d_iu: 0, vit_c_mg: 4.7 } },
  { id: 'zucchini', name: 'Calabacín', category: 'veg', isHemeIron: false, isHighCalcium: true, isHighVitC: false, isPlantBased: true, per100g: { calories: 15, protein_g: 1.1, fat_g: 0.4, carbs_g: 2.7, iron_mg: 0.4, calcium_mg: 15, zinc_mg: 0.3, vit_d_iu: 0, vit_c_mg: 12.9 } },
  { id: 'bell_pepper_red', name: 'Pimiento Rojo', category: 'veg', isHemeIron: false, isHighCalcium: false, isHighVitC: true, isPlantBased: true, per100g: { calories: 26, protein_g: 1, fat_g: 0.3, carbs_g: 6, iron_mg: 0.4, calcium_mg: 7, zinc_mg: 0.3, vit_d_iu: 0, vit_c_mg: 127.7 } },
  { id: 'cauliflower', name: 'Coliflor', category: 'veg', isHemeIron: false, isHighCalcium: true, isHighVitC: true, isPlantBased: true, per100g: { calories: 23, protein_g: 1.8, fat_g: 0.5, carbs_g: 4.1, iron_mg: 0.4, calcium_mg: 16, zinc_mg: 0.2, vit_d_iu: 0, vit_c_mg: 44.3 } },
  { id: 'green_beans', name: 'Judías Verdes', category: 'veg', isHemeIron: false, isHighCalcium: true, isHighVitC: false, isPlantBased: true, per100g: { calories: 35, protein_g: 2.4, fat_g: 0.1, carbs_g: 7.9, iron_mg: 0.7, calcium_mg: 44, zinc_mg: 0.3, vit_d_iu: 0, vit_c_mg: 9.7 } },
  { id: 'corn', name: 'Maíz Dulce', category: 'veg', isHemeIron: false, isHighCalcium: false, isHighVitC: false, isPlantBased: true, per100g: { calories: 86, protein_g: 3.2, fat_g: 1.2, carbs_g: 19, iron_mg: 0.5, calcium_mg: 2, zinc_mg: 0.5, vit_d_iu: 0, vit_c_mg: 6.8 } },
  { id: 'beetroot', name: 'Betabel / Remolacha', category: 'veg', isHemeIron: false, isHighCalcium: true, isHighVitC: false, isPlantBased: true, per100g: { calories: 44, protein_g: 1.7, fat_g: 0.2, carbs_g: 10, iron_mg: 0.8, calcium_mg: 16, zinc_mg: 0.4, vit_d_iu: 0, vit_c_mg: 3.6 } },
  { id: 'tomato', name: 'Tomate', category: 'veg', isHemeIron: false, isHighCalcium: false, isHighVitC: false, isPlantBased: true, per100g: { calories: 18, protein_g: 0.9, fat_g: 0.2, carbs_g: 3.9, iron_mg: 0.3, calcium_mg: 10, zinc_mg: 0.2, vit_d_iu: 0, vit_c_mg: 13.7 } },
  { id: 'cucumber', name: 'Pepino', category: 'veg', isHemeIron: false, isHighCalcium: false, isHighVitC: false, isPlantBased: true, per100g: { calories: 15, protein_g: 0.7, fat_g: 0.1, carbs_g: 3.6, iron_mg: 0.3, calcium_mg: 16, zinc_mg: 0.2, vit_d_iu: 0, vit_c_mg: 2.8 } },

  // --- LÁCTEOS Y EXTRAS ---
  { id: 'yogurt_plain', name: 'Yogurt Griego Natural', category: 'dairy', isHemeIron: false, isHighCalcium: true, isHighVitC: false, isPlantBased: false, per100g: { calories: 59, protein_g: 10, fat_g: 0.4, carbs_g: 3.6, iron_mg: 0.1, calcium_mg: 110, zinc_mg: 0.6, vit_d_iu: 0, vit_c_mg: 0 } },
  { id: 'cheddar', name: 'Queso Cheddar', category: 'dairy', isHemeIron: false, isHighCalcium: true, isHighVitC: false, isPlantBased: false, per100g: { calories: 402, protein_g: 25, fat_g: 33, carbs_g: 1.3, iron_mg: 0.7, calcium_mg: 721, zinc_mg: 3.1, vit_d_iu: 24, vit_c_mg: 0 } },
  { id: 'cottage_cheese', name: 'Queso Cottage', category: 'dairy', isHemeIron: false, isHighCalcium: true, isHighVitC: false, isPlantBased: false, per100g: { calories: 98, protein_g: 11, fat_g: 4.3, carbs_g: 3.4, iron_mg: 0.1, calcium_mg: 83, zinc_mg: 0.4, vit_d_iu: 0, vit_c_mg: 0 } },
  { id: 'milk_whole', name: 'Leche Entera', category: 'dairy', isHemeIron: false, isHighCalcium: true, isHighVitC: false, isPlantBased: false, per100g: { calories: 61, protein_g: 3.2, fat_g: 3.2, carbs_g: 4.8, iron_mg: 0, calcium_mg: 113, zinc_mg: 0.4, vit_d_iu: 44, vit_c_mg: 0 } },
  { id: 'oats', name: 'Avena (Cocida)', category: 'grain', isHemeIron: false, isHighCalcium: false, isHighVitC: false, isPlantBased: true, per100g: { calories: 71, protein_g: 2.5, fat_g: 1.5, carbs_g: 12, iron_mg: 1.7, calcium_mg: 14, zinc_mg: 0.6, vit_d_iu: 0, vit_c_mg: 0 } },
  { id: 'quinoa', name: 'Quinoa (Cocida)', category: 'grain', isHemeIron: false, isHighCalcium: false, isHighVitC: false, isPlantBased: true, per100g: { calories: 120, protein_g: 4.4, fat_g: 1.9, carbs_g: 21, iron_mg: 1.5, calcium_mg: 17, zinc_mg: 1.1, vit_d_iu: 0, vit_c_mg: 0 } },
  { id: 'chia_seeds', name: 'Semillas de Chía (Secas)', category: 'fat', isHemeIron: false, isHighCalcium: true, isHighVitC: false, isPlantBased: true, per100g: { calories: 486, protein_g: 17, fat_g: 31, carbs_g: 42, iron_mg: 7.7, calcium_mg: 631, zinc_mg: 4.6, vit_d_iu: 0, vit_c_mg: 1.6 } },
  { id: 'pumkin_seeds', name: 'Semillas de Calabaza (Peladas)', category: 'fat', isHemeIron: false, isHighCalcium: false, isHighVitC: false, isPlantBased: true, per100g: { calories: 559, protein_g: 30, fat_g: 49, carbs_g: 10.7, iron_mg: 8.8, calcium_mg: 46, zinc_mg: 7.6, vit_d_iu: 0, vit_c_mg: 1.9 } },
  { id: 'peanut_butter', name: 'Mantequilla de Maní', category: 'fat', isHemeIron: false, isHighCalcium: false, isHighVitC: false, isPlantBased: true, per100g: { calories: 588, protein_g: 25, fat_g: 50, carbs_g: 20, iron_mg: 1.9, calcium_mg: 43, zinc_mg: 2.5, vit_d_iu: 0, vit_c_mg: 0 } },
];