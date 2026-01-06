import React, { useEffect, useState } from 'react';
import { FoodItemDB, DailyTargets, NutritionalValues, Suggestion, ChildProfile } from '../types';
import { FOOD_DATABASE } from '../constants';
import { getSmartRecipe } from '../services/geminiService';
import { Lightbulb, CheckCircle2, ChefHat, ArrowRight } from 'lucide-react';

interface Props {
  current: NutritionalValues;
  targets: DailyTargets;
  child: ChildProfile;
}

export const InverseRecommendations: React.FC<Props> = ({ current, targets, child }) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [aiRecipe, setAiRecipe] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    // 1. Calculate Gaps
    const ironGap = targets.iron_mg - current.iron_mg;
    const proteinGap = targets.protein_g - current.protein_g;
    const calciumGap = targets.calcium_mg - current.calcium_mg;

    const newSuggestions: Suggestion[] = [];

    // 2. Logic: Priority to Iron (Neurodevelopment)
    // Note: Variable names in code can stay English, but mapped values must be Spanish
    if (ironGap > 2) {
      const candidate = FOOD_DATABASE.find(f => f.per100g.iron_mg > 3); 
      if (candidate) {
        const amountNeeded = (ironGap / candidate.per100g.iron_mg) * 100;
        newSuggestions.push({
          nutrient: 'Hierro',
          deficitAmount: ironGap,
          suggestedFood: candidate.name,
          suggestedAmountG: Math.round(amountNeeded),
          reasoning: candidate.isHemeIron ? "Alta absorción" : "¡Combina con Vitamina C!",
          priority: 'HIGH'
        });
      }
    }
    else if (proteinGap > 5) {
        const candidate = FOOD_DATABASE.find(f => f.per100g.protein_g > 10);
        if (candidate) {
          const amountNeeded = (proteinGap / candidate.per100g.protein_g) * 100;
          newSuggestions.push({
            nutrient: 'Proteína',
            deficitAmount: proteinGap,
            suggestedFood: candidate.name,
            suggestedAmountG: Math.round(amountNeeded),
            reasoning: "Esencial para el crecimiento",
            priority: 'MEDIUM'
          });
        }
    }
    else if (calciumGap > 200) {
        const candidate = FOOD_DATABASE.find(f => f.per100g.calcium_mg > 100);
        if (candidate) {
            const amountNeeded = (calciumGap / candidate.per100g.calcium_mg) * 100;
            newSuggestions.push({
                nutrient: 'Calcio',
                deficitAmount: calciumGap,
                suggestedFood: candidate.name,
                suggestedAmountG: Math.round(amountNeeded),
                reasoning: "Desarrollo óseo",
                priority: 'MEDIUM'
            });
        }
    }

    setSuggestions(newSuggestions);
    setAiRecipe(null); 

  }, [current, targets]);

  const handleGenerateRecipe = async (sugg: Suggestion) => {
    setLoadingAi(true);
    const recipe = await getSmartRecipe(child.name, 24, sugg.nutrient, sugg.deficitAmount);
    setAiRecipe(recipe);
    setLoadingAi(false);
  };

  if (suggestions.length === 0) return (
    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
       <div className="bg-emerald-100 p-2.5 rounded-full text-emerald-600">
         <CheckCircle2 className="w-6 h-6" />
       </div>
       <div>
         <h4 className="text-base font-bold text-emerald-900">Sin déficits críticos</h4>
         <p className="text-sm text-emerald-700 opacity-90">¡Excelente trabajo hoy!</p>
       </div>
    </div>
  );

  const topSuggestion = suggestions[0];
  const priorityColor = topSuggestion.priority === 'HIGH' ? 'text-amber-700 bg-amber-100' : 'text-blue-700 bg-blue-100';
  const borderColor = topSuggestion.priority === 'HIGH' ? 'border-amber-400' : 'border-blue-400';

  return (
    <div className={`bg-white border-l-[6px] ${borderColor} rounded-r-2xl shadow-md p-5 animate-in slide-in-from-bottom-2`}>
      
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <Lightbulb className={`w-5 h-5 ${topSuggestion.priority === 'HIGH' ? 'text-amber-500' : 'text-blue-500'}`} />
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Acción Recomendada</h3>
        </div>
        <span className={`${priorityColor} text-[10px] font-extrabold px-2 py-1 rounded-md tracking-wider`}>
          PRIORIDAD {topSuggestion.priority === 'HIGH' ? 'ALTA' : 'MEDIA'}
        </span>
      </div>

      <div className="mb-4">
        <p className="text-slate-500 text-xs uppercase font-bold mb-1">Déficit Detectado</p>
        <p className="text-slate-800 font-medium text-xl">
           <span className="font-bold">-{topSuggestion.deficitAmount.toFixed(1)}</span> {topSuggestion.nutrient === 'Hierro' ? 'mg' : 'g'} {topSuggestion.nutrient}
        </p>
      </div>

      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-4">
        <p className="text-slate-700 text-sm">
          Sugerencia: Ofrecer <strong>{topSuggestion.suggestedAmountG}g de {topSuggestion.suggestedFood}</strong>.
        </p>
        <p className="text-xs text-slate-400 mt-1 italic flex items-center gap-1">
          <ArrowRight className="w-3 h-3" /> {topSuggestion.reasoning}
        </p>
      </div>

      {aiRecipe ? (
         <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-sm text-indigo-900 flex gap-3 animate-in fade-in">
            <ChefHat className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block mb-1 text-indigo-700 font-bold">Chef NutriPeque:</strong> 
              {aiRecipe}
            </div>
         </div>
      ) : (
        <button 
          onClick={() => handleGenerateRecipe(topSuggestion)}
          disabled={loadingAi}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
        >
          {loadingAi ? 'El Chef está pensando...' : `✨ Generar Receta para ${child.name}`}
        </button>
      )}
    </div>
  );
};