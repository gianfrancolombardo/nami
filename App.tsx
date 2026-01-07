import React, { useState, useEffect, useMemo } from 'react';
import { ChildProfile, DailyLog, FoodEntry, DailyTargets, NutritionalValues } from './types';
import { calculateAgeInMonths, calculateTargets, EMPTY_STATS } from './constants';
import { NutrientHUD } from './components/NutrientHUD';
import { InverseRecommendations } from './components/InverseRecommendations';
// import { parseFoodInput } from './services/geminiService'; 
// import { parseFoodInput } from './services/openaiService';
import { parseFoodInput } from './services/aiManager'; // Unified Manager
import { FirestoreService } from './services/db';
import { PlusCircle, Utensils, Calendar, ChevronDown, User, Baby, Scale, ArrowRight, Loader2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Sub-components for structure ---

const Onboarding: React.FC<{ onComplete: (p: ChildProfile) => void, isLoading: boolean }> = ({ onComplete, isLoading }) => {
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100"
      >
        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12 }}
            className="bg-indigo-100 p-3 rounded-full"
          >
            <Baby className="w-8 h-8 text-indigo-600" />
          </motion.div>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2 text-center tracking-tight">¡Hola, soy Nami! 👋</h1>
        <p className="text-slate-500 mb-8 text-center text-sm">
          Vamos a crear el perfil de tu peque para empezar esta aventura.
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
                placeholder="Ej. Leo, Sofía..."
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
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Peso actual (kg)</label>
            <div className="relative">
              <Scale className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium"
                placeholder="Ej. 12.5"
                required
              />
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition-transform shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 disabled:bg-indigo-400"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>¡Listo, vamos! <ArrowRight className="w-4 h-4" /></>}
          </motion.button>
        </form>
      </motion.div >
    </div >
  );
};

// --- Main App ---

export default function App() {
  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [currentEntries, setCurrentEntries] = useState<FoodEntry[]>([]);

  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  // 1. Initial Load: Get Profiles
  useEffect(() => {
    const loadProfiles = async () => {
      setIsLoadingData(true);
      try {
        const fetchedProfiles = await FirestoreService.getProfiles();
        setProfiles(fetchedProfiles);
        if (fetchedProfiles.length > 0) {
          setActiveProfileId(fetchedProfiles[0].id);
        }
      } catch (e) {
        console.error("Error loading profiles:", e);
      } finally {
        setIsLoadingData(false);
      }
    };
    loadProfiles();
  }, []);

  // 2. Log Load: Get Daily Log when activeProfile or today changes
  useEffect(() => {
    const loadDailyLog = async () => {
      if (!activeProfileId) {
        setCurrentEntries([]);
        return;
      }
      // Note: We don't necessarily toggle isLoadingData here to avoid flashing the whole screen,
      // but we could have a specific loading state for the dashboard.
      try {
        const log = await FirestoreService.getDailyLog(activeProfileId, today);
        setCurrentEntries(log ? log.entries : []);
      } catch (e) {
        console.error("Error loading daily log:", e);
        setCurrentEntries([]);
      }
    };
    loadDailyLog();
  }, [activeProfileId, today]);

  const activeProfile = useMemo(() =>
    profiles.find(p => p.id === activeProfileId),
    [profiles, activeProfileId]);

  const ageMonths = useMemo(() =>
    activeProfile ? calculateAgeInMonths(activeProfile.birthDate) : 0,
    [activeProfile]);

  const targets = useMemo(() =>
    activeProfile ? calculateTargets(ageMonths, activeProfile.weightKg) : null,
    [activeProfile, ageMonths]);

  const dailyStats = useMemo(() => {
    if (!currentEntries.length) return EMPTY_STATS;

    return currentEntries.reduce((acc, entry) => {
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
  }, [currentEntries]);

  const handleAddProfile = async (p: ChildProfile) => {
    setIsLoadingData(true);
    try {
      await FirestoreService.createProfile(p);
      setProfiles(prev => [...prev, p]);
      setActiveProfileId(p.id);
    } catch (e) {
      console.error("Error creating profile:", e);
      alert("Error creando el perfil. Intente nuevamente.");
    } finally {
      setIsLoadingData(false);
    }
  };

  const sanitizeNutrients = (n: any): NutritionalValues => ({
    calories: Number(n?.calories) || 0,
    protein_g: Number(n?.protein_g) || 0,
    fat_g: Number(n?.fat_g) || 0,
    carbs_g: Number(n?.carbs_g) || 0,
    iron_mg: Number(n?.iron_mg) || 0,
    calcium_mg: Number(n?.calcium_mg) || 0,
    zinc_mg: Number(n?.zinc_mg) || 0,
    vit_d_iu: Number(n?.vit_d_iu) || 0,
    vit_c_mg: Number(n?.vit_c_mg) || 0,
  });

  const handleLogFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeProfileId) return;

    setIsProcessing(true);
    // @ts-ignore
    const results = await parseFoodInput(input, ageMonths);

    if (results && Array.isArray(results) && results.length > 0) {
      const newEntries: FoodEntry[] = results.map((r: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: r.name || 'Alimento desconocido',
        amount_g: Number(r.amount_g) || 0,
        timestamp: new Date().toISOString(),
        nutrients: sanitizeNutrients(r.nutrients)
      }));

      try {
        await Promise.all(newEntries.map(entry =>
          FirestoreService.addFoodEntry(activeProfileId, today, entry)
        ));

        setCurrentEntries(prev => [...prev, ...newEntries]);
        setInput('');
      } catch (err) {
        console.error("Error saving food:", err);
        alert("Hubo un problema guardando el alimento.");
      }
    } else if (results && !Array.isArray(results)) {
      // Fallback safe handling
      const r: any = results;
      const newEntry: FoodEntry = {
        id: Date.now().toString(),
        name: r.name || 'Alimento desconocido',
        amount_g: Number(r.amount_g) || 0,
        timestamp: new Date().toISOString(),
        nutrients: sanitizeNutrients(r.nutrients)
      };
      try {
        await FirestoreService.addFoodEntry(activeProfileId, today, newEntry);
        setCurrentEntries(prev => [...prev, newEntry]);
        setInput('');
      } catch (err) {
        console.error("Error saving food (fallback):", err);
      }
    } else {
      alert("La IA no entendió el alimento. Intenta con algo más simple.");
    }
    setIsProcessing(false);
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!activeProfileId) return;

    try {
      await FirestoreService.deleteFoodEntry(activeProfileId, today, entryId);
      setCurrentEntries(prev => prev.filter(e => e.id !== entryId));
    } catch (err) {
      console.error("Error deleting entry:", err);
      alert("No se pudo eliminar el registro.");
    }
  };

  if (isLoadingData && profiles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium animate-pulse">Cargando Nami...</p>
        </div>
      </div>
    );
  }

  if (profiles.length === 0) {
    return <Onboarding onComplete={handleAddProfile} isLoading={isLoadingData} />;
  }

  if (!activeProfile || !targets) return <div className="min-h-screen flex items-center justify-center text-slate-400">Cargando perfil...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-12 font-sans selection:bg-indigo-100 selection:text-indigo-900">

      {/* Top Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="bg-indigo-600 p-1.5 rounded-lg shadow-indigo-200 shadow-lg">
              <Baby className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900">Nami</span>
          </motion.div>

          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowProfileSwitcher(!showProfileSwitcher)}
              className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 pl-1 pr-3 py-1 rounded-full transition-colors text-sm font-semibold text-slate-700 border border-slate-200 shadow-sm"
            >
              <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white uppercase shadow-sm">
                {activeProfile.name[0]}
              </div>
              {activeProfile.name}
              <ChevronDown className={cn("w-3 h-3 text-slate-400 transition-transform duration-200", showProfileSwitcher && "rotate-180")} />
            </motion.button>

            <AnimatePresence>
              {showProfileSwitcher && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl py-2 text-slate-800 border border-slate-100 z-50 ring-1 ring-black/5"
                >
                  <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Mis Niños</div>
                  {profiles.map(p => (
                    <button
                      key={p.id}
                      onClick={() => { setActiveProfileId(p.id); setShowProfileSwitcher(false); }}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3 text-sm font-medium transition-colors"
                    >
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-600 border border-slate-200 uppercase">{p.name[0]}</div>
                      {p.name}
                    </button>
                  ))}
                  <div className="border-t border-slate-100 my-1"></div>
                  <button onClick={() => { /* Implement global add profile logic if needed, or redirect */ alert("Función en desarrollo: Crear otro perfil"); }} className="w-full text-left px-4 py-3 text-sm text-indigo-600 font-semibold hover:bg-indigo-50 flex items-center gap-2">
                    <PlusCircle className="w-4 h-4" /> Agregar otro niño
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto p-5 lg:p-8">

        {/* Child Context Banner (Floating) */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-end px-1 pb-6 pt-2"
        >
          <div>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-800 tracking-tight">¡Hola familia! 👋</h2>
            <p className="text-slate-500 text-sm lg:text-base">
              Cuidando a <span className="font-bold text-indigo-600">{activeProfile.name}</span> <span className="text-slate-300">|</span> {ageMonths} mesazos
            </p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-1.5 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm text-slate-500 text-xs font-bold"
          >
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            Hoy, {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Input and Stats (Mobile First Focus) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">

            {/* 1. Input Section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 overflow-hidden relative"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Utensils className="w-4 h-4" /> ¿Qué comió hoy?
              </h3>

              <form onSubmit={handleLogFood} className="relative group">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder='Cuéntame qué comió... ejemplo: "Desayunó un huevo revuelto y media tostada"'
                  className="w-full p-5 pr-14 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none resize-none text-base transition-all min-h-[120px] placeholder:text-slate-400 font-medium"
                  disabled={isProcessing}
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="submit"
                  disabled={!input || isProcessing}
                  className="absolute right-3 bottom-3 p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:bg-slate-300 transition-all shadow-lg active:scale-90 z-10"
                >
                  {isProcessing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <ArrowRight className="w-5 h-5" />
                  )}
                </motion.button>
              </form>
              <div className="mt-4 flex items-start gap-3 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/50">
                <div className="text-indigo-500 mt-0.5"><Scale className="w-3.5 h-3.5" /></div>
                <p className="text-[11px] text-indigo-800 leading-relaxed font-medium">
                  <strong>Magia de Nami:</strong> Calculo las porciones automáticamente según que {activeProfile.name} tiene {ageMonths} meses. 🪄
                </p>
              </div>
            </motion.div>

            {/* 2. Dashboard / HUD */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <NutrientHUD current={dailyStats} targets={targets} />
            </motion.div>
          </div>

          {/* Right Column: Recommendations and Logs */}
          <div className="lg:col-span-7 space-y-6">

            {/* 3. Inverse Recommendation Engine */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <InverseRecommendations current={dailyStats} targets={targets} child={activeProfile} />
            </motion.div>

            {/* 4. Recent Logs (Feed) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-[0.2em]">Historial de Hoy</h3>
                <span className="text-[10px] font-bold text-slate-300 uppercase">{currentEntries.length} registros</span>
              </div>

              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {currentEntries.slice().reverse().map(entry => (
                    <motion.div
                      key={entry.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, x: -20 }}
                      className="bg-white p-5 rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex justify-between items-center group hover:border-indigo-200 transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-xl shadow-inner group-hover:bg-indigo-50 transition-colors">
                          <Utensils className="w-5 h-5 text-slate-300 group-hover:text-indigo-400" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 text-base block group-hover:text-indigo-900 transition-colors">{entry.name}</span>
                          <span className="text-slate-400 text-xs font-bold bg-slate-100 px-2.5 py-1 rounded-lg mt-1 inline-block uppercase tracking-wider">{entry.amount_g}g</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex gap-2 text-[10px] font-bold">
                          {entry.nutrients.iron_mg > 0.1 && (
                            <span className="text-rose-600 bg-rose-50 px-2 py-1 rounded-lg border border-rose-100/50 shadow-sm">
                              FE {entry.nutrients.iron_mg.toFixed(1)}
                            </span>
                          )}
                          {entry.nutrients.protein_g > 0.5 && (
                            <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100/50 shadow-sm">
                              PR {entry.nutrients.protein_g.toFixed(1)}
                            </span>
                          )}
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1, backgroundColor: '#fee2e2', color: '#ef4444' }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="p-2 text-slate-300 rounded-xl transition-all"
                          title="Eliminar registro"
                        >
                          <Trash2 className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {currentEntries.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-16 text-slate-300 bg-white/50 rounded-3xl border border-dashed border-slate-200"
                  >
                    <div className="bg-slate-50 p-4 rounded-full mb-4">
                      <Utensils className="w-8 h-8 opacity-30" />
                    </div>
                    <p className="text-sm font-bold uppercase tracking-widest opacity-50">¡Aún no ha comido nada!</p>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}