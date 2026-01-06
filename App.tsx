import React, { useState, useEffect, useMemo } from 'react';
import { ChildProfile, DailyLog, FoodEntry, DailyTargets, NutritionalValues } from './types';
import { calculateAgeInMonths, calculateTargets, EMPTY_STATS } from './constants';
import { NutrientHUD } from './components/NutrientHUD';
import { InverseRecommendations } from './components/InverseRecommendations';
import { parseFoodInput } from './services/geminiService';
import { PlusCircle, Utensils, Calendar, ChevronDown, User, Baby, Scale, ArrowRight } from 'lucide-react';

// --- Sub-components for structure ---

const Onboarding: React.FC<{ onComplete: (p: ChildProfile) => void }> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [weight, setWeight] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && dob && weight) {
      onComplete({
        id: Date.now().toString(),
        name,
        birthDate: dob,
        weightKg: parseFloat(weight)
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-100 p-3 rounded-full">
            <Baby className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2 text-center tracking-tight">NutriPeque AI</h1>
        <p className="text-slate-500 mb-8 text-center text-sm">
          Configuremos el perfil de neurodesarrollo de tu pequeño para comenzar.
        </p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="group">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Nombre</label>
            <div className="relative">
               <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
               <input 
                 type="text" 
                 value={name} 
                 onChange={e => setName(e.target.value)} 
                 className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm font-medium" 
                 placeholder="Ej. Leo" 
                 required 
               />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Fecha de Nacimiento</label>
            <input 
              type="date" 
              value={dob} 
              onChange={e => setDob(e.target.value)} 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm text-slate-700" 
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Peso Actual (kg)</label>
            <div className="relative">
              <Scale className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <input 
                type="number" 
                step="0.1" 
                value={weight} 
                onChange={e => setWeight(e.target.value)} 
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium" 
                placeholder="11.5" 
                required 
              />
            </div>
          </div>
          <button 
            type="submit" 
            className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition-transform active:scale-[0.98] shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
          >
            Crear Perfil <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);

  const activeProfile = useMemo(() => 
    profiles.find(p => p.id === activeProfileId), 
  [profiles, activeProfileId]);

  const ageMonths = useMemo(() => 
    activeProfile ? calculateAgeInMonths(activeProfile.birthDate) : 0, 
  [activeProfile]);

  const targets = useMemo(() => 
    activeProfile ? calculateTargets(ageMonths, activeProfile.weightKg) : null,
  [activeProfile, ageMonths]);

  const today = new Date().toISOString().split('T')[0];

  const dailyStats = useMemo(() => {
    if (!activeProfileId) return EMPTY_STATS;
    
    const todayLog = logs.find(l => l.date === today && l.childId === activeProfileId);
    if (!todayLog) return EMPTY_STATS;

    return todayLog.entries.reduce((acc, entry) => {
      return {
        calories: acc.calories + entry.nutrients.calories,
        protein_g: acc.protein_g + entry.nutrients.protein_g,
        fat_g: acc.fat_g + entry.nutrients.fat_g,
        carbs_g: acc.carbs_g + entry.nutrients.carbs_g,
        iron_mg: acc.iron_mg + entry.nutrients.iron_mg,
        calcium_mg: acc.calcium_mg + entry.nutrients.calcium_mg,
        zinc_mg: acc.zinc_mg + entry.nutrients.zinc_mg,
        vit_d_iu: acc.vit_d_iu + entry.nutrients.vit_d_iu,
        vit_c_mg: acc.vit_c_mg + entry.nutrients.vit_c_mg,
      };
    }, { ...EMPTY_STATS });
  }, [logs, activeProfileId, today]);

  const handleAddProfile = (p: ChildProfile) => {
    setProfiles(prev => [...prev, p]);
    setActiveProfileId(p.id);
  };

  const handleLogFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeProfileId) return;

    setIsProcessing(true);
    const result = await parseFoodInput(input, ageMonths);
    setIsProcessing(false);

    if (result) {
      const newEntry: FoodEntry = {
        id: Date.now().toString(),
        name: result.name,
        amount_g: result.amount_g,
        timestamp: new Date().toISOString(),
        nutrients: result.nutrients
      };

      setLogs(prev => {
        const existingLogIndex = prev.findIndex(l => l.date === today && l.childId === activeProfileId);
        if (existingLogIndex >= 0) {
          const updatedLogs = [...prev];
          updatedLogs[existingLogIndex].entries.push(newEntry);
          return updatedLogs;
        } else {
          return [...prev, { date: today, childId: activeProfileId, entries: [newEntry] }];
        }
      });
      setInput('');
    } else {
      alert("La IA no entendió ese alimento. Prueba con '50g de huevo cocido'.");
    }
  };

  if (profiles.length === 0) {
    return <Onboarding onComplete={handleAddProfile} />;
  }

  if (!activeProfile || !targets) return <div className="min-h-screen flex items-center justify-center text-slate-400">Cargando...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-12 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Top Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <Baby className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900">NutriPeque AI</span>
          </div>
          
          <div className="relative">
             <button 
               onClick={() => setShowProfileSwitcher(!showProfileSwitcher)}
               className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 pl-1 pr-3 py-1 rounded-full transition-colors text-sm font-semibold text-slate-700 border border-slate-200"
             >
                <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-700">
                  {activeProfile.name[0]}
                </div>
                {activeProfile.name}
                <ChevronDown className="w-3 h-3 text-slate-400" />
             </button>

             {showProfileSwitcher && (
               <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl py-2 text-slate-800 border border-slate-100 animate-in fade-in zoom-in-95 duration-200 ring-1 ring-black/5">
                 <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Mis Niños</div>
                 {profiles.map(p => (
                   <button 
                    key={p.id}
                    onClick={() => { setActiveProfileId(p.id); setShowProfileSwitcher(false); }}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3 text-sm font-medium transition-colors"
                   >
                     <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-600 border border-slate-200">{p.name[0]}</div>
                     {p.name}
                   </button>
                 ))}
                 <div className="border-t border-slate-100 my-1"></div>
                 <button onClick={() => { setProfiles([]); }} className="w-full text-left px-4 py-3 text-sm text-indigo-600 font-semibold hover:bg-indigo-50 flex items-center gap-2">
                   <PlusCircle className="w-4 h-4" /> Agregar otro niño
                 </button>
               </div>
             )}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-xl mx-auto p-5 space-y-6">
        
        {/* Child Context Banner */}
        <div className="flex justify-between items-end px-1 pt-2">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Hola, Papá/Mamá</h2>
            <p className="text-slate-500 text-sm">Nutrición de <span className="font-bold text-indigo-600">{activeProfile.name}</span> <span className="text-slate-300">|</span> {ageMonths} meses</p>
          </div>
          <div className="text-right">
             <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm text-slate-500 text-xs font-bold">
               <Calendar className="w-3.5 h-3.5 text-indigo-500" />
               Hoy
             </div>
          </div>
        </div>

        {/* 1. Dashboard / HUD */}
        <NutrientHUD current={dailyStats} targets={targets} />

        {/* 2. Inverse Recommendation Engine */}
        <InverseRecommendations current={dailyStats} targets={targets} child={activeProfile} />

        {/* 3. Input Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 overflow-hidden">
           <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
             <Utensils className="w-4 h-4 text-slate-400" /> Registrar Comida
           </h3>
           
           <form onSubmit={handleLogFood} className="relative group">
             <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder='Prueba: "Se comió medio plátano" o "Un tazón pequeño de lentejas"...'
                className="w-full p-4 pr-14 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none text-sm transition-all min-h-[100px] placeholder:text-slate-400"
                disabled={isProcessing}
             />
             <button 
               type="submit"
               disabled={!input || isProcessing}
               className="absolute right-3 bottom-3 p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:bg-slate-300 transition-all shadow-md active:scale-90"
             >
               {isProcessing ? (
                 <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
               ) : (
                 <ArrowRight className="w-5 h-5" />
               )}
             </button>
           </form>
           <div className="mt-3 flex items-start gap-2 bg-indigo-50 p-2.5 rounded-lg">
             <div className="text-indigo-500 mt-0.5"><Scale className="w-3 h-3" /></div>
             <p className="text-[10px] text-indigo-800 leading-tight">
               <strong>Autocalibración:</strong> La IA estima porciones basadas en el apetito promedio de un niño de {ageMonths} meses.
             </p>
           </div>
        </div>

        {/* 4. Recent Logs (Feed) */}
        <div className="space-y-3 pb-8">
           <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest px-1">Historial de Hoy</h3>
           <div className="space-y-2">
            {logs.find(l => l.date === today && l.childId === activeProfileId)?.entries.map(entry => (
                <div key={entry.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex justify-between items-center text-sm group hover:border-indigo-100 transition-colors">
                    <div>
                    <span className="font-bold text-slate-700 block">{entry.name}</span>
                    <span className="text-slate-400 text-xs font-medium bg-slate-50 px-2 py-0.5 rounded-full">{entry.amount_g}g</span>
                    </div>
                    <div className="flex gap-2 text-xs font-mono">
                    {entry.nutrients.iron_mg > 0.5 && (
                        <span className="text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                        Fe {entry.nutrients.iron_mg.toFixed(1)}
                        </span>
                    )}
                    {entry.nutrients.protein_g > 3 && (
                        <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                        Pr {entry.nutrients.protein_g.toFixed(1)}
                        </span>
                    )}
                    </div>
                </div>
            ))}
           </div>
           
           {!logs.find(l => l.date === today && l.childId === activeProfileId) && (
             <div className="flex flex-col items-center justify-center py-10 text-slate-300 bg-white/50 rounded-2xl border border-dashed border-slate-200">
               <Utensils className="w-8 h-8 mb-2 opacity-50" />
               <p className="text-sm italic">Aún no hay comidas registradas hoy.</p>
             </div>
           )}
        </div>

      </main>
    </div>
  );
}