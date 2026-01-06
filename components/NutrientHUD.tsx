import React from 'react';
import { DailyTargets, NutritionalValues } from '../types';
import { Zap, Bone, Activity, Flame, Drumstick } from 'lucide-react';

interface Props {
  current: NutritionalValues;
  targets: DailyTargets;
}

const ProgressBar: React.FC<{ 
  label: string; 
  icon?: React.ReactNode;
  current: number; 
  target: number; 
  unit: string; 
  critical?: boolean 
}> = ({ label, icon, current, target, unit, critical }) => {
  const percentage = Math.min(100, Math.max(0, (current / target) * 100));
  const isOver = current > target * 1.2;
  
  let colorClass = 'bg-slate-200';
  let barColor = 'bg-slate-300';
  
  if (current > 0) {
    if (percentage < 80) barColor = 'bg-gradient-to-r from-amber-300 to-orange-400';
    else if (percentage >= 80 && !isOver) barColor = 'bg-emerald-500';
    else if (isOver) barColor = 'bg-rose-500';
  }

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center text-xs font-semibold mb-1.5 text-slate-600">
        <div className="flex items-center gap-1.5">
          {icon && <span className="text-slate-400">{icon}</span>}
          <span>{label} {critical && <span className="text-rose-500 ml-0.5" title="Crítico para neurodesarrollo">•</span>}</span>
        </div>
        <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">
          {current.toFixed(1)} / {target} {unit}
        </span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
        <div 
          className={`h-full transition-all duration-700 rounded-full ${barColor} shadow-[0_0_10px_rgba(0,0,0,0.05)]`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export const NutrientHUD: React.FC<Props> = ({ current, targets }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
      <div className="flex items-center justify-between mb-5 border-b border-slate-50 pb-3">
        <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest flex items-center gap-2">
           Resumen Diario
        </h3>
        <span className="text-[10px] text-slate-400 font-medium bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
           Objetivos Neuro
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
        <div>
          <h4 className="text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-wider">Micros Críticos</h4>
          <ProgressBar 
            label="Hierro" 
            icon={<Activity className="w-3 h-3 text-rose-400" />}
            current={current.iron_mg} target={targets.iron_mg} unit="mg" critical 
          />
          <ProgressBar 
            label="Calcio" 
            icon={<Bone className="w-3 h-3 text-indigo-400" />}
            current={current.calcium_mg} target={targets.calcium_mg} unit="mg" critical 
          />
          <ProgressBar 
            label="Zinc" 
            icon={<Zap className="w-3 h-3 text-amber-400" />}
            current={current.zinc_mg} target={targets.zinc_mg} unit="mg" 
          />
        </div>
        
        <div className="mt-2 md:mt-0">
          <h4 className="text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-wider">Macros Energía</h4>
          <ProgressBar 
            label="Proteína" 
            icon={<Drumstick className="w-3 h-3 text-blue-400" />}
            current={current.protein_g} target={targets.protein_g} unit="g" 
          />
          <ProgressBar 
            label="Calorías" 
            icon={<Flame className="w-3 h-3 text-orange-400" />}
            current={current.calories} target={targets.calories} unit="kcal" 
          />
        </div>
      </div>
    </div>
  );
};