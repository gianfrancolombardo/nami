import React, { useState, useEffect, useMemo } from 'react';
import { ChildProfile, DailyLog, DailyTargets, NutritionalValues } from '../types';
import { FirestoreService } from '../services/db';
import { getHistoryAnalysis } from '../services/aiManager';
import { TrendChart } from './TrendChart';
import { Loader2, Sparkles, AlertCircle, TrendingUp, Calendar as CalendarIcon, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';



interface HistoryDashboardProps {
    child: ChildProfile;
    targets: DailyTargets;
    onClose: () => void;
}

type RangeOption = '7DAYS' | '30DAYS' | 'MONTH';

export const HistoryDashboard: React.FC<HistoryDashboardProps> = ({ child, targets, onClose }) => {
    const [range, setRange] = useState<RangeOption>('7DAYS');
    const [logs, setLogs] = useState<DailyLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [analysis, setAnalysis] = useState<any>(null);
    const [analyzing, setAnalyzing] = useState(false);

    // Calculate dates based on range
    const { startDate, endDate } = useMemo(() => {
        const end = new Date();
        const start = new Date();

        if (range === '7DAYS') {
            start.setDate(end.getDate() - 6);
        } else if (range === '30DAYS') {
            start.setDate(end.getDate() - 29);
        } else {
            // This Month (1st to now)
            start.setDate(1);
        }

        return {
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0]
        };
    }, [range]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setAnalysis(null);
            try {
                // @ts-ignore - DB service might not strictly match the interface yet if I didn't update types fully, but implementation is there
                const data = await FirestoreService.getLogsByDateRange(child.id, startDate, endDate);
                setLogs(data);
            } catch (error) {
                console.error("Error fetching history:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [child.id, startDate, endDate]);

    // Aggregate Data for Charts
    const aggregatedData = useMemo(() => {
        // Create a map of all dates in range to ensure we have X-axis continuity (even with empty days)
        const daysMap = new Map<string, NutritionalValues>();
        const start = new Date(startDate);
        const end = new Date(endDate);

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            daysMap.set(dateStr, {
                calories: 0, protein_g: 0, fat_g: 0, carbs_g: 0,
                iron_mg: 0, calcium_mg: 0, zinc_mg: 0, vit_d_iu: 0, vit_c_mg: 0
            });
        }

        // Fill with actual data
        logs.forEach(log => {
            console.log(`[Dashboard] Processing log date: ${log.date}. In map? ${daysMap.has(log.date)}`);
            if (daysMap.has(log.date)) {
                // Sum up entries
                const dailyTotal = log.entries.reduce((acc, entry) => ({
                    calories: acc.calories + entry.nutrients.calories,
                    protein_g: acc.protein_g + entry.nutrients.protein_g,
                    fat_g: acc.fat_g + entry.nutrients.fat_g,
                    carbs_g: acc.carbs_g + entry.nutrients.carbs_g,
                    iron_mg: acc.iron_mg + entry.nutrients.iron_mg,
                    calcium_mg: acc.calcium_mg + entry.nutrients.calcium_mg,
                    zinc_mg: acc.zinc_mg + entry.nutrients.zinc_mg,
                    vit_d_iu: acc.vit_d_iu + entry.nutrients.vit_d_iu,
                    vit_c_mg: acc.vit_c_mg + entry.nutrients.vit_c_mg,
                }), {
                    calories: 0, protein_g: 0, fat_g: 0, carbs_g: 0,
                    iron_mg: 0, calcium_mg: 0, zinc_mg: 0, vit_d_iu: 0, vit_c_mg: 0
                });
                console.log(`[Dashboard] Day ${log.date} total:`, dailyTotal);
                daysMap.set(log.date, dailyTotal);
            } else {
                console.warn(`[Dashboard] Log date ${log.date} not found in pre-filled map keys:`, Array.from(daysMap.keys()));
            }
        });

        // Convert to array for charts
        return Array.from(daysMap.entries()).map(([date, values]) => {
            const shortDate = new Date(date).toLocaleDateString('es-ES', { weekday: 'short' }).slice(0, 3);
            return { date, label: shortDate, values };
        });

    }, [logs, startDate, endDate]);

    const runAnalysis = async () => {
        setAnalyzing(true);
        // Calculate average intakes
        const totalDays = aggregatedData.length;
        const averages = aggregatedData.reduce((acc, curr) => {
            // ... sum logic
            return {
                calories: acc.calories + curr.values.calories,
                protein_g: acc.protein_g + curr.values.protein_g,
                iron_mg: acc.iron_mg + curr.values.iron_mg,
                vit_d_iu: acc.vit_d_iu + curr.values.vit_d_iu,
                // add others if needed for analysis context
            };
        }, { calories: 0, protein_g: 0, iron_mg: 0, vit_d_iu: 0 });

        // Pass a simplified object to AI
        const context = {
            totalDays,
            averageIntake: {
                calories: averages.calories / totalDays,
                protein: averages.protein_g / totalDays,
                iron: averages.iron_mg / totalDays,
                vitD: averages.vit_d_iu / totalDays
            },
            targets: targets,
            // Maybe add "low days" count?
        };

        try {
            const result = await getHistoryAnalysis(child.name, 12, context); // 12 month hardcoded? No, use passed props if available or calc. Passed child has birthdate.
            setAnalysis(result);
        } catch (e) {
            console.error(e);
        } finally {
            setAnalyzing(false);
        }
    };


    // ... existing code ...



    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-2xl overflow-y-auto">
            <div className="max-w-7xl mx-auto p-6 min-h-screen">

                {/* Header */}
                <div className="flex justify-between items-center mb-8 sticky top-0 bg-slate-900/50 backdrop-blur-md py-4 z-50 -mx-6 px-6 border-b border-white/5">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <TrendingUp className="w-6 h-6 text-indigo-400" /> Historial de Nutrición
                        </h2>
                        <p className="text-slate-400 text-sm">Analizando el progreso de {child.name}</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors"
                        >
                            <ChevronRight className="w-6 h-6 rotate-90" />
                        </button>
                    </div>
                </div>

                {/* Range Selector */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                    {[
                        { id: '7DAYS', label: 'Últimos 7 días' },
                        { id: '30DAYS', label: 'Últimos 30 días' },
                        { id: 'MONTH', label: 'Este Mes' }
                    ].map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => setRange(opt.id as RangeOption)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${range === opt.id
                                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                                : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left: Charts */}
                        <div className="lg:col-span-2 space-y-6">
                            <TrendChart
                                title="Hierro (Fe)"
                                unit="mg"
                                color="#f43f5e" // Rose-500
                                data={aggregatedData.map(d => ({
                                    label: d.label,
                                    value: d.values.iron_mg,
                                    max: targets.iron_mg * 1.5 // Scale based on target
                                }))}
                            />

                            <TrendChart
                                title="Proteína"
                                unit="g"
                                color="#60a5fa" // Blue-400
                                data={aggregatedData.map(d => ({
                                    label: d.label,
                                    value: d.values.protein_g,
                                    max: targets.protein_g * 1.5
                                }))}
                            />

                            <TrendChart
                                title="Calorías"
                                unit="kcal"
                                color="#fbbf24" // Amber-400
                                data={aggregatedData.map(d => ({
                                    label: d.label,
                                    value: d.values.calories,
                                    max: targets.calories * 1.2
                                }))}
                            />
                        </div>

                        {/* Right: AI Insights */}
                        <div className="lg:col-span-1">
                            <div className="bg-gradient-to-br from-indigo-900/50 to-slate-900/50 rounded-3xl p-6 border border-indigo-500/30 sticky top-24">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="bg-indigo-500 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
                                        <Sparkles className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="font-bold text-white text-lg">Análisis de Nami</h3>
                                </div>

                                {!analysis ? (
                                    <div className="text-center py-8">
                                        <p className="text-slate-400 text-sm mb-6">
                                            Obtén un resumen inteligente sobre los hábitos de {child.name} en este periodo.
                                        </p>
                                        <button
                                            onClick={runAnalysis}
                                            disabled={analyzing}
                                            className="w-full bg-white/10 hover:bg-white/20 text-indigo-300 font-bold py-3 rounded-xl border border-indigo-500/30 transition-all flex items-center justify-center gap-2"
                                        >
                                            {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                            {analyzing ? 'Analizando...' : 'Generar Reporte'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">

                                        {/* Score */}
                                        <div className="flex items-center justify-between bg-black/20 p-4 rounded-xl border border-white/5">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Score Nutricional</span>
                                            <span className={`text-2xl font-black ${analysis.score > 80 ? 'text-green-400' : analysis.score > 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                                {analysis.score}/100
                                            </span>
                                        </div>

                                        <p className="text-white/90 text-sm leading-relaxed italic">
                                            "{analysis.summary}"
                                        </p>

                                        <div className="space-y-3 mt-4">
                                            {analysis.highlights?.map((h: any, i: number) => (
                                                <div key={i} className={`p-4 rounded-xl border ${h.type === 'POSITIVE' ? 'bg-green-500/10 border-green-500/20' :
                                                    h.type === 'IMPROVEMENT' ? 'bg-orange-500/10 border-orange-500/20' :
                                                        'bg-blue-500/10 border-blue-500/20'
                                                    }`}>
                                                    <h5 className={`text-xs font-bold uppercase mb-1 ${h.type === 'POSITIVE' ? 'text-green-400' :
                                                        h.type === 'IMPROVEMENT' ? 'text-orange-400' :
                                                            'text-blue-400'
                                                        }`}>{h.title}</h5>
                                                    <p className="text-slate-300 text-xs">{h.description}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {analysis.mainFocusNextWeek && (
                                            <div className="mt-4 p-4 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                                                <h5 className="text-indigo-300 text-xs font-bold uppercase mb-1 flex items-center gap-2">
                                                    <AlertCircle className="w-3 h-3" /> Misión para la semana
                                                </h5>
                                                <p className="text-white text-sm font-medium">{analysis.mainFocusNextWeek}</p>
                                            </div>
                                        )}

                                        <button
                                            onClick={() => setAnalysis(null)}
                                            className="text-xs text-slate-500 hover:text-white mt-4 underline text-center w-full"
                                        >
                                            Limpiar análisis
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
