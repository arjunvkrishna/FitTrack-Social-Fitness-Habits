import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Plus } from 'lucide-react';

interface WaterBowlProps {
    current: number;
    goal: number;
    unit: string;
    onAddWater: (amount: number) => void;
}

const WaterBowl: React.FC<WaterBowlProps> = ({ current, goal, unit, onAddWater }) => {
    const [adding, setAdding] = useState(false);
    const percentage = Math.min(100, Math.max(0, (current / goal) * 100));
    
    // Generate some random bubbles
    const bubbles = Array.from({ length: 25 }).map((_, i) => ({
        id: i,
        size: Math.random() * 8 + 4,
        left: Math.random() * 80 + 10,
        delay: Math.random() * 3,
        duration: Math.random() * 2 + 2,
    }));

    // Calculate translate Y based on percentage. 100% = 0px, 0% = 200px
    const topOffset = 100 - percentage;

    const handleAdd = (amount: number) => {
        setAdding(true);
        onAddWater(amount);
        setTimeout(() => setAdding(false), 1000);
    };

    return (
        <div className="glass p-6 md:col-span-2 lg:col-span-2 flex flex-col sm:flex-row items-center justify-center sm:justify-around gap-8 relative overflow-hidden group">
            {/* Left side: The Bowl */}
            <div className="relative flex flex-col items-center">
                <h3 className="font-bold text-xl mb-4 z-10 text-white shadow-black drop-shadow-md">Hydration Station</h3>
                
                <div className="relative w-48 h-48 sm:w-56 sm:h-56 shrink-0 rounded-full border-[6px] border-white/10 bg-black/40 shadow-[inset_0_-10px_20px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center overflow-hidden z-10 transition-transform hover:scale-105 duration-300">
                    
                    {/* Glossy Reflection overlay */}
                    <div className="absolute inset-x-4 top-2 h-1/3 bg-gradient-to-b from-white/20 to-transparent rounded-full z-20 pointer-events-none" />

                    {/* The Liquid Container */}
                    <motion.div 
                        className="absolute inset-0 z-0"
                        initial={{ y: "100%" }}
                        animate={{ y: `${topOffset}%` }}
                        transition={{ type: "spring", stiffness: 45, damping: 15 }}
                    >
                        {/* The Base Liquid Background */}
                        <div className="absolute top-0 w-full h-[200%] bg-gradient-to-t from-blue-600 to-cyan-400 opacity-90" />
                        
                        {/* The Wave 1 (Back) */}
                        <div className="absolute -top-[150%] -left-[50%] w-[200%] aspect-square rounded-[40%] bg-blue-500/30 animate-[spin_8s_linear_infinite]" />
                        
                        {/* The Wave 2 (Front) */}
                        <div className="absolute -top-[140%] -left-[50%] w-[200%] aspect-square rounded-[43%] bg-cyan-300/40 animate-[spin_11s_linear_infinite_reverse]" />

                        {/* Sparkling Bubbles */}
                        {bubbles.map(b => (
                            <motion.div
                                key={b.id}
                                className="absolute bottom-0 rounded-full bg-white/60 blur-[1px]"
                                style={{ 
                                    width: b.size, 
                                    height: b.size, 
                                    left: `${b.left}%`,
                                    bottom: '-20px'
                                }}
                                animate={{
                                    y: ['0px', '-250px'],
                                    opacity: [0, 1, 0],
                                    x: [0, Math.random() * 40 - 20, Math.random() * 40 - 20]
                                }}
                                transition={{
                                    duration: b.duration,
                                    repeat: Infinity,
                                    delay: b.delay,
                                    ease: "easeIn"
                                }}
                            />
                        ))}
                    </motion.div>

                    {/* Text Display */}
                    <div className="z-30 flex flex-col items-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mt-2 pointer-events-none">
                        <Droplets className="text-cyan-300 mb-1" size={28} />
                        <h4 className="text-4xl font-black tracking-tight text-white mb-0 leading-none">{current}</h4>
                        <p className="text-sm font-bold text-cyan-200">/ {goal} {unit}</p>
                    </div>

                    {/* Adding Highlight Animation */}
                    <AnimatePresence>
                        {adding && (
                            <motion.div 
                                className="absolute inset-0 bg-cyan-300/30 pointer-events-none z-30 mix-blend-overlay"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0, 1, 0] }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.8 }}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Right side: Quick Add Actions */}
            <div className="flex flex-col gap-4 z-10 w-full sm:w-auto">
                <p className="text-sm text-text-muted font-bold tracking-widest uppercase text-center sm:text-left mb-2">Quick Add</p>
                <button 
                    onClick={() => handleAdd(250)}
                    className="flex justify-between items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-4 rounded-2xl transition-all hover:scale-105 active:scale-95 group"
                >
                    <div className="flex items-center gap-3">
                        <Droplets size={20} className="text-cyan-400" />
                        <span className="font-bold text-lg">Glass</span>
                    </div>
                    <span className="font-mono text-cyan-300 font-bold bg-cyan-900/30 px-3 py-1 rounded-lg">+250ml</span>
                </button>
                <button 
                    onClick={() => handleAdd(500)}
                    className="flex justify-between items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-4 rounded-2xl transition-all hover:scale-105 active:scale-95 group"
                >
                    <div className="flex items-center gap-3">
                        <Droplets size={24} className="text-blue-400" />
                        <span className="font-bold text-lg">Bottle</span>
                    </div>
                    <span className="font-mono text-blue-300 font-bold bg-blue-900/30 px-3 py-1 rounded-lg">+500ml</span>
                </button>
            </div>
            
            {/* Ambient Glow */}
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-64 bg-cyan-500/20 blur-[80px] pointer-events-none -z-10" />
        </div>
    );
};

export default WaterBowl;
