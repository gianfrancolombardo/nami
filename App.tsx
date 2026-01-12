import React, { useState, useEffect, useMemo } from 'react';
import { ChildProfile, DailyLog, FoodEntry, DailyTargets, NutritionalValues } from './types';
import { calculateAgeInMonths, calculateTargets, EMPTY_STATS } from './constants';
import { NutrientHUD } from './components/NutrientHUD';
import { InverseRecommendations } from './components/InverseRecommendations';
// import { parseFoodInput } from './services/geminiService'; 
// import { parseFoodInput } from './services/openaiService';
import { parseFoodInput, parseFoodImage } from './services/aiManager'; // Unified Manager
import { FirestoreService } from './services/db';
import { HistoryDashboard } from './components/HistoryDashboard';
import { PlusCircle, Utensils, Calendar, ChevronDown, User, Baby, Scale, ArrowRight, Loader2, Trash2, Camera, X, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
// ... existing imports

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
    <div className="min-h-screen flex items-center justify-center p-6 bg-transparent">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20"
      >
        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12 }}
            className="bg-indigo-500/20 p-3 rounded-full border border-indigo-500/30"
          >
            <Baby className="w-8 h-8 text-indigo-300" />
          </motion.div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2 text-center tracking-tight">¡Hola, soy Nami! 👋</h1>
        <p className="text-slate-300 mb-8 text-center text-sm">
          Vamos a crear el perfil de tu peque para empezar esta aventura.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="group">
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1 ml-1">Nombre</label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm font-medium text-white placeholder-white/30"
                placeholder="Ej. Leo, Sofía..."
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1 ml-1">Fecha de Nacimiento</label>
            <input
              type="date"
              value={dob}
              onChange={e => setDob(e.target.value)}
              className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm text-white [color-scheme:dark]"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1 ml-1">Peso actual (kg)</label>
            <div className="relative">
              <Scale className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium text-white placeholder-white/30"
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
            className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-3.5 rounded-xl transition-transform shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:bg-indigo-500/50"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>¡Listo, vamos! <ArrowRight className="w-4 h-4" /></>}
          </motion.button>
        </form>
      </motion.div >
    </div >
  );
};

export default function App() {
  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [currentEntries, setCurrentEntries] = useState<FoodEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false); // NEW STATE

  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedImage) || !activeProfileId) return;

    setIsProcessing(true);
    let results: any = null;

    try {
      if (selectedImage) {
        // @ts-ignore
        results = await parseFoodImage(selectedImage, ageMonths);
      } else {
        // @ts-ignore
        results = await parseFoodInput(input, ageMonths);
      }

      if (results && Array.isArray(results) && results.length > 0) {
        const newEntries: FoodEntry[] = results.map((r: any) => ({
          id: Math.random().toString(36).substr(2, 9),
          name: r.name || 'Alimento desconocido',
          amount_g: Number(r.amount_g) || 0,
          timestamp: new Date().toISOString(),
          nutrients: sanitizeNutrients(r.nutrients)
        }));

        await Promise.all(newEntries.map(entry =>
          FirestoreService.addFoodEntry(activeProfileId, today, entry)
        ));

        setCurrentEntries(prev => [...prev, ...newEntries]);

        // Clear Roadmap Cache
        localStorage.removeItem(`NAMI_ROADMAP_${activeProfileId}`);

        setInput('');
        setSelectedImage(null);
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
        await FirestoreService.addFoodEntry(activeProfileId, today, newEntry);
        setCurrentEntries(prev => [...prev, newEntry]);

        // Clear Roadmap Cache to trigger regeneration
        localStorage.removeItem(`NAMI_ROADMAP_${activeProfileId}`);

        setInput('');
        setSelectedImage(null);
      } else {
        alert("La IA no entendió el alimento. Intenta con algo más simple.");
      }
    } catch (err) {
      console.error("Error saving food:", err);
      alert("Hubo un problema guardando el alimento.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!activeProfileId) return;

    try {
      await FirestoreService.deleteFoodEntry(activeProfileId, today, entryId);
      setCurrentEntries(prev => prev.filter(e => e.id !== entryId));

      // Clear Roadmap Cache to trigger regeneration
      localStorage.removeItem(`NAMI_ROADMAP_${activeProfileId}`);

    } catch (err) {
      console.error("Error deleting entry:", err);
      alert("No se pudo eliminar el registro.");
    }
  };

  if (isLoadingData && profiles.length === 0) {
    // ... existing loader
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mx-auto mb-4" />
          <p className="text-white/70 font-medium animate-pulse">Cargando Nami...</p>
        </div>
      </div>
    );
  }

  if (profiles.length === 0) {
    return <Onboarding onComplete={handleAddProfile} isLoading={isLoadingData} />;
  }

  if (!activeProfile || !targets) return <div className="min-h-screen flex items-center justify-center text-slate-400">Cargando perfil...</div>;

  return (
    <div className="min-h-screen bg-transparent pb-24 md:pb-12 font-sans selection:bg-indigo-500/30 selection:text-white">

      {/* Top Navigation */}
      <nav className="bg-slate-900/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="bg-indigo-600 p-1.5 rounded-lg shadow-indigo-500/20 shadow-lg">
              <Baby className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-white">Nami</span>
          </motion.div>

          {/* RIGHT SIDE NAV */}
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowHistory(true)}
              className="hidden md:flex items-center gap-2 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-full transition-colors text-xs font-bold text-indigo-300 border border-indigo-500/20"
            >
              <BarChart2 className="w-4 h-4" /> Historial
            </motion.button>

            <div className="relative">
              {/* Profile Switcher (existing) */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowProfileSwitcher(!showProfileSwitcher)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 pl-1 pr-3 py-1 rounded-full transition-colors text-sm font-semibold text-white border border-white/10 shadow-sm"
              >
                <div className="w-7 h-7 bg-indigo-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white uppercase shadow-sm">
                  {activeProfile.name[0]}
                </div>
                {activeProfile.name}
                <ChevronDown className={cn("w-3 h-3 text-white/50 transition-transform duration-200", showProfileSwitcher && "rotate-180")} />
              </motion.button>
              {/* ... existing Switcher AnimatePresence ... */}
              <AnimatePresence>
                {showProfileSwitcher && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-2xl py-2 text-white border border-white/10 z-50"
                  >
                    <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Mis Niños</div>
                    {profiles.map(p => (
                      <button
                        key={p.id}
                        onClick={() => { setActiveProfileId(p.id); setShowProfileSwitcher(false); }}
                        className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center gap-3 text-sm font-medium transition-colors text-slate-200"
                      >
                        <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-xs font-bold text-white border border-white/10 uppercase">{p.name[0]}</div>
                        {p.name}
                      </button>
                    ))}
                    <div className="border-t border-white/10 my-1"></div>
                    <button onClick={() => { /* Implement global add profile logic if needed, or redirect */ alert("Función en desarrollo: Crear otro perfil"); }} className="w-full text-left px-4 py-3 text-sm text-indigo-400 font-semibold hover:bg-white/5 flex items-center gap-2">
                      <PlusCircle className="w-4 h-4" /> Agregar otro niño
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
            <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">¡Hola familia! 👋</h2>
            <p className="text-slate-400 text-sm lg:text-base">
              Cuidando a <span className="font-bold text-indigo-300">{activeProfile.name}</span> <span className="text-slate-600">|</span> {ageMonths} mesazos
            </p>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowHistory(true)}
              className="md:hidden flex items-center gap-2 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-2 rounded-xl transition-colors text-xs font-bold text-indigo-300 border border-indigo-500/20"
            >
              <BarChart2 className="w-4 h-4" />
            </motion.button>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-1.5 bg-white/10 px-4 py-2 rounded-full border border-white/10 shadow-sm text-slate-300 text-xs font-bold backdrop-blur-md"
            >
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              Hoy, {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
            </motion.div>
          </div>
        </motion.div>

        {/* HISTORY DASHBOARD OVERLAY */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <HistoryDashboard
                child={activeProfile}
                targets={targets}
                onClose={() => setShowHistory(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Input and Stats (Mobile First Focus) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">

            {/* 1. Input Section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-xl border border-white/10 p-6 overflow-hidden relative"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500/80"></div>
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Utensils className="w-4 h-4" /> ¿Qué comió hoy?
              </h3>

              <form onSubmit={handleLogFood} className="relative group">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={selectedImage ? 'Añade notas sobre la foto (opcional)...' : 'Cuéntame qué comió... ejemplo: "Desayunó un huevo revuelto y media tostada"'}
                  className="w-full p-5 pr-14 bg-black/20 border border-white/5 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/50 outline-none resize-none text-base transition-all min-h-[120px] placeholder:text-slate-500 font-medium text-white pb-20"
                  disabled={isProcessing}
                />

                {/* Image Preview Area */}
                <AnimatePresence>
                  {selectedImage && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute left-4 bottom-20 z-20"
                    >
                      <div className="relative group/image">
                        <img
                          src={selectedImage}
                          alt="Preview"
                          className="w-16 h-16 object-cover rounded-xl border-2 border-indigo-500 shadow-lg"
                        />
                        <button
                          type="button"
                          onClick={() => setSelectedImage(null)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow-sm opacity-0 group-hover/image:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="absolute right-3 bottom-3 flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    id="food-image-upload"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <motion.label
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    htmlFor="food-image-upload"
                    className={`p-3 rounded-xl cursor-pointer transition-all shadow-lg flex items-center justify-center ${selectedImage ? 'bg-indigo-500/20 text-indigo-300 ring-2 ring-indigo-500/50' : 'bg-white/10 text-slate-300 hover:bg-white/20'}`}
                  >
                    <Camera className="w-5 h-5" />
                  </motion.label>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="submit"
                    disabled={(!input && !selectedImage) || isProcessing}
                    className="p-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-400 disabled:opacity-50 disabled:bg-slate-600 transition-all shadow-lg active:scale-90"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <ArrowRight className="w-5 h-5" />
                    )}
                  </motion.button>
                </div>
              </form>
              <div className="mt-4 flex items-start gap-3 bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20">
                <div className="text-indigo-400 mt-0.5"><Scale className="w-3.5 h-3.5" /></div>
                <p className="text-[11px] text-indigo-200 leading-relaxed font-medium">
                  <strong>Magia de Nami:</strong> Sube una foto 📸 o escribe. Calculo las porciones para {activeProfile.name} ({ageMonths}m). 🪄
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
                <span className="text-[10px] font-bold text-slate-500 uppercase">{currentEntries.length} registros</span>
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
                      className="bg-white/5 backdrop-blur-md p-5 rounded-3xl border border-white/10 shadow-lg flex justify-between items-center group hover:bg-white/10 transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-xl shadow-inner group-hover:bg-indigo-500/10 transition-colors border border-white/5">
                          <Utensils className="w-5 h-5 text-slate-400 group-hover:text-indigo-300" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-200 text-base block group-hover:text-white transition-colors">{entry.name}</span>
                          <span className="text-slate-500 text-xs font-bold bg-white/5 px-2.5 py-1 rounded-lg mt-1 inline-block uppercase tracking-wider">{entry.amount_g}g</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex gap-2 text-[10px] font-bold">
                          {entry.nutrients.iron_mg > 0.1 && (
                            <span className="text-rose-300 bg-rose-500/10 px-2 py-1 rounded-lg border border-rose-500/20 shadow-sm">
                              FE {entry.nutrients.iron_mg.toFixed(1)}
                            </span>
                          )}
                          {entry.nutrients.protein_g > 0.5 && (
                            <span className="text-blue-300 bg-blue-500/10 px-2 py-1 rounded-lg border border-blue-500/20 shadow-sm">
                              PR {entry.nutrients.protein_g.toFixed(1)}
                            </span>
                          )}
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1, backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5' }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="p-2 text-slate-500 rounded-xl transition-all"
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
                    className="flex flex-col items-center justify-center py-16 text-slate-500 bg-white/5 rounded-3xl border border-dashed border-white/10"
                  >
                    <div className="bg-white/5 p-4 rounded-full mb-4">
                      <Utensils className="w-8 h-8 opacity-30 text-white" />
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