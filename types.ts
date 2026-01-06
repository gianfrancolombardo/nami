export interface NutritionalValues {
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

export interface ChildProfile {
  id: string;
  name: string;
  birthDate: string; // YYYY-MM-DD
  weightKg: number;
  avatarUrl?: string;
}

export interface DailyTargets extends NutritionalValues {
  // Extended interface if we need specific target flags
}

export interface FoodEntry {
  id: string;
  name: string;
  timestamp: string;
  amount_g: number;
  nutrients: NutritionalValues;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  childId: string;
  entries: FoodEntry[];
}

export interface Suggestion {
  nutrient: string;
  deficitAmount: number;
  suggestedFood: string;
  suggestedAmountG: number;
  reasoning: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

// For Hardcoded DB
export interface FoodItemDB {
  id: string;
  name: string;
  category: 'protein' | 'fruit' | 'veg' | 'dairy' | 'grain' | 'fat';
  isHemeIron: boolean;
  isHighCalcium: boolean;
  isHighVitC: boolean;
  per100g: NutritionalValues;
}