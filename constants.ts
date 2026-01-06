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

// --- Base de Datos "Memoria Rígida" (En Español) ---
export const FOOD_DATABASE: FoodItemDB[] = [
  {
    id: 'lentils_cooked',
    name: 'Lentejas Cocidas',
    category: 'protein',
    isHemeIron: false,
    isHighCalcium: false,
    isHighVitC: false,
    per100g: { calories: 116, protein_g: 9, fat_g: 0.4, carbs_g: 20, iron_mg: 3.3, calcium_mg: 19, zinc_mg: 1.3, vit_d_iu: 0, vit_c_mg: 1.5 }
  },
  {
    id: 'chicken_liver',
    name: 'Hígado de Pollo',
    category: 'protein',
    isHemeIron: true,
    isHighCalcium: false,
    isHighVitC: false,
    per100g: { calories: 167, protein_g: 24.5, fat_g: 6.5, carbs_g: 0.9, iron_mg: 11, calcium_mg: 8, zinc_mg: 4, vit_d_iu: 0, vit_c_mg: 18 }
  },
  {
    id: 'orange',
    name: 'Naranja (Trozos)',
    category: 'fruit',
    isHemeIron: false,
    isHighCalcium: false,
    isHighVitC: true,
    per100g: { calories: 47, protein_g: 0.9, fat_g: 0.1, carbs_g: 12, iron_mg: 0.1, calcium_mg: 40, zinc_mg: 0.1, vit_d_iu: 0, vit_c_mg: 53 }
  },
  {
    id: 'yogurt_plain',
    name: 'Yogurt Natural',
    category: 'dairy',
    isHemeIron: false,
    isHighCalcium: true,
    isHighVitC: false,
    per100g: { calories: 59, protein_g: 10, fat_g: 0.4, carbs_g: 3.6, iron_mg: 0.1, calcium_mg: 110, zinc_mg: 1, vit_d_iu: 0, vit_c_mg: 0 }
  },
  {
    id: 'egg_boiled',
    name: 'Huevo Cocido',
    category: 'protein',
    isHemeIron: false,
    isHighCalcium: false,
    isHighVitC: false,
    per100g: { calories: 155, protein_g: 13, fat_g: 11, carbs_g: 1.1, iron_mg: 1.2, calcium_mg: 50, zinc_mg: 1, vit_d_iu: 87, vit_c_mg: 0 }
  },
  {
    id: 'spinach_cooked',
    name: 'Espinacas Cocidas',
    category: 'veg',
    isHemeIron: false,
    isHighCalcium: true,
    isHighVitC: false,
    per100g: { calories: 23, protein_g: 2.9, fat_g: 0.4, carbs_g: 3.6, iron_mg: 3.6, calcium_mg: 136, zinc_mg: 0.5, vit_d_iu: 0, vit_c_mg: 9.8 }
  },
  {
    id: 'salmon',
    name: 'Salmón al Horno',
    category: 'protein',
    isHemeIron: true,
    isHighCalcium: false,
    isHighVitC: false,
    per100g: { calories: 206, protein_g: 22, fat_g: 13, carbs_g: 0, iron_mg: 0.8, calcium_mg: 15, zinc_mg: 0.6, vit_d_iu: 526, vit_c_mg: 0 }
  }
];

export const EMPTY_STATS: NutritionalValues = {
  calories: 0, protein_g: 0, fat_g: 0, carbs_g: 0,
  iron_mg: 0, calcium_mg: 0, zinc_mg: 0, vit_d_iu: 0, vit_c_mg: 0
};