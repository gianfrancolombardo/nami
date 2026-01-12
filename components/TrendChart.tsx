import React from 'react';
import { motion } from 'framer-motion';

interface TrendChartProps {
    data: { label: string; value: number; max: number }[];
    title: string;
    unit: string;
    color: string;
}

export const TrendChart: React.FC<TrendChartProps> = ({ data, title, unit, color }) => {
    // Determine gap size based on data density
    const isDense = data.length > 10;
    const gapClass = isDense ? 'gap-0.5' : 'gap-2';

    return (
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 shadow-lg w-full">
            <h4 className="text-white text-sm font-bold mb-4 uppercase tracking-wider flex justify-between">
                <span>{title}</span>
                <span className="text-white/40 text-xs">{unit}</span>
            </h4>

            <div className={`flex items-end justify-between h-32 ${gapClass}`}>
                {data.map((item, index) => {
                    // Safe calculation
                    const safeMax = item.max > 0 ? item.max : 100;
                    const rawPercentage = (item.value / safeMax) * 100;
                    // Clamp between 2% (visibility) and 100%
                    const percentage = Math.min(Math.max(rawPercentage, 0), 100);

                    // Debug log in development only if needed, or just rely on visual

                    return (
                        <div key={index} className="flex flex-col items-center gap-2 flex-1 h-full justify-end group relative">
                            {/* Tooltip */}
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none mb-1 border border-white/10 shadow-xl">
                                <span className="font-bold">{item.value.toFixed(1)}</span> {unit}
                            </div>

                            {/* Bar Container */}
                            <div className="w-full bg-white/5 rounded-t-lg relative w-full flex items-end overflow-hidden" style={{ height: '100%' }}>
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${percentage}%` }}
                                    transition={{ duration: 0.8, delay: index * 0.1, type: "spring", bounce: 0.2 }}
                                    className="w-full rounded-t-md absolute bottom-0 left-0 right-0 mx-auto"
                                    style={{
                                        backgroundColor: color,
                                        opacity: 0.9
                                    }}
                                />
                                {/* Value label inside bar if tall enough, else above? No, keep tooltip for clean look */}
                            </div>

                            {/* Date Label */}
                            <span className="text-[10px] text-slate-500 font-bold uppercase truncate w-full text-center">
                                {item.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
