import React, { useEffect, useState } from 'react';
import { FoodItemDB, DailyTargets, NutritionalValues, Suggestion, ChildProfile } from '../types';
import { getNutritionalRoadmap, getSmartRecipe } from '../services/aiManager';
import { Lightbulb, CheckCircle2, ChefHat, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Props {
  current: NutritionalValues;
  targets: DailyTargets;
  child: ChildProfile;
}

export const InverseRecommendations: React.FC<Props> = ({ current, targets, child }) => {
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [aiRecipe, setAiRecipe] = useState<string | null>(null);
  const [loadingRecipe, setLoadingRecipe] = useState(false);

  useEffect(() => {
    const fetchRoadmap = async () => {
      const gaps = [
        { nutrient: 'Hierro', amount: targets.iron_mg - current.iron_mg },
        { nutrient: 'Proteína', amount: targets.protein_g - current.protein_g },
        { nutrient: 'Calcio', amount: targets.calcium_mg - current.calcium_mg },
        { nutrient: 'Zinc', amount: targets.zinc_mg - current.zinc_mg },
        { nutrient: 'Vit C', amount: targets.vit_c_mg - current.vit_c_mg },
        { nutrient: 'Vit D', amount: targets.vit_d_iu - current.vit_d_iu }
      ].filter(g => g.amount > (g.nutrient === 'Calcio' ? 50 : 0.5));

      if (gaps.length === 0) {
        setRoadmap(null);
        return;
      }

      setLoading(true);
      const data = await getNutritionalRoadmap(child.name, 24, gaps.sort((a, b) => b.amount - a.amount).slice(0, 3));
      if (data) setRoadmap(data);
      setLoading(false);
    };

    fetchRoadmap();
  }, [current, targets]);

  const handleGenerateUnifiedRecipe = async () => {
    if (!roadmap || !roadmap.gaps) return;
    setLoadingRecipe(true);

    // Collect specific data for EACH suggested option across all gaps
    const ingredientsData = roadmap.gaps.flatMap((gap: any) =>
      (gap.options || []).map((opt: any) => ({
        name: opt.name,
        nutrient: gap.nutrient,
        amount: opt.amountG
      }))
    );

    const recipe = await getSmartRecipe(child.name, 24, ingredientsData);
    setAiRecipe(recipe);
    setLoadingRecipe(false);
  };

  if (loading) return (
    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 flex flex-col items-center justify-center gap-4 shadow-sm animate-pulse min-h-[300px]">
      <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Consultando al Chef Nami...</p>
    </div>
  );

  if (!roadmap) return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-emerald-50 border border-emerald-100 rounded-[2rem] p-8 flex flex-col gap-4 items-center text-center shadow-sm"
    >
      <div className="bg-white p-3 rounded-full text-emerald-500 shadow-sm">
        <CheckCircle2 className="w-8 h-8" />
      </div>
      <div>
        <h4 className="text-xl font-black text-emerald-900 tracking-tight mb-1">¡Misión Cumplida!</h4>
        <p className="text-emerald-700/80 font-medium text-sm">{child.name} tiene todo lo que necesita por hoy.</p>
      </div>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] p-6 lg:p-8 border border-slate-100 relative overflow-hidden"
    >
      {/* Header */}
      <div className="flex flex-col gap-3 mb-8">
        <div className="flex items-center gap-2 text-indigo-500 mb-1">
          <Sparkles className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Plan Completo de Hoy</span>
        </div>
        <h2 className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight leading-tight">
          {roadmap.empatheticMessage}
        </h2>
      </div>

      {/* Render All Gaps */}
      <div className="flex flex-col gap-8 mb-8">
        {roadmap.gaps && roadmap.gaps.map((gap: any, gapIdx: number) => {
          const isPrimary = gapIdx === 0;
          return (
            <div key={gap.nutrient} className={cn("flex flex-col gap-4", !isPrimary && "opacity-90")}>
              <div className="flex items-center gap-2">
                <div className={cn("px-3 py-1 rounded-lg font-black text-xs uppercase tracking-wide", isPrimary ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500")}>
                  {isPrimary ? "Prioridad 1" : "Secundario"}
                </div>
                <h3 className={cn("font-black text-slate-800", isPrimary ? "text-xl" : "text-lg")}>
                  Falta: {gap.nutrient}
                </h3>
              </div>

              <div className={cn("grid gap-4", isPrimary ? "grid-cols-1 md:grid-cols-2" : "grid-cols-2 md:grid-cols-2")}>
                {(gap.options || []).map((opt: any) => (
                  <div key={opt.name} className={cn(
                    "flex flex-col p-4 rounded-[1.5rem] border transition-all",
                    isPrimary ? "bg-slate-50 border-slate-100 hover:shadow-md" : "bg-white border-slate-100 text-sm"
                  )}>
                    <div className="flex justify-between items-start mb-2">
                      <span className={cn("font-black text-slate-800 leading-tight", isPrimary ? "text-lg" : "text-sm")}>{opt.name}</span>
                      <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded ml-2 whitespace-nowrap">{opt.amountG}g</span>
                    </div>

                    {/* Synergy Tip */}
                    <div className="mt-auto pt-2 border-t border-slate-100/50">
                      <div className="flex gap-1.5 items-start">
                        <Lightbulb className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                        <p className="text-[10px] leading-tight text-slate-500 font-medium">
                          {opt.synergy}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Unified Recipe Button */}
      <AnimatePresence mode='wait'>
        {!aiRecipe ? (
          <motion.button
            key="generate-btn"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={handleGenerateUnifiedRecipe}
            disabled={loadingRecipe}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full relative group overflow-hidden bg-slate-900 rounded-[1.5rem] p-4 flex items-center justify-center gap-3 transition-all hover:shadow-xl hover:shadow-indigo-500/20"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 flex items-center gap-3">
              {loadingRecipe ? (
                <>
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                  <span className="text-white font-bold text-sm">Cocinando ideas con todo...</span>
                </>
              ) : (
                <>
                  <ChefHat className="w-5 h-5 text-indigo-300 group-hover:text-white transition-colors" />
                  <span className="text-white font-bold text-sm tracking-wide">Crear Super Menú con TODO ✨</span>
                </>
              )}
            </div>
          </motion.button>
        ) : (
          <motion.div
            key="recipe-card"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-900 rounded-[2rem] p-6 lg:p-8 text-white relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-2 rounded-xl">
                  <ChefHat className="w-5 h-5 text-indigo-300" />
                </div>
                <div>
                  <h3 className="text-indigo-300 text-xs font-black uppercase tracking-[0.2em] mb-0.5">Chef Nami</h3>
                  <p className="text-xs text-slate-400 font-medium">Propuesta Directa</p>
                </div>
              </div>
              <button
                onClick={() => setAiRecipe(null)}
                className="text-white/40 hover:text-white transition-colors"
              >
                Cerrar
              </button>
            </div>

            <div className="prose prose-invert prose-sm max-w-none">
              <p className="text-slate-200 whitespace-pre-line leading-relaxed text-sm lg:text-base font-medium">
                {aiRecipe}
              </p>
            </div>

            <button
              onClick={() => setAiRecipe(null)}
              className="mt-6 w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-400 transition-all border border-white/5 hover:border-white/10"
            >
              Cerrar Receta
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
