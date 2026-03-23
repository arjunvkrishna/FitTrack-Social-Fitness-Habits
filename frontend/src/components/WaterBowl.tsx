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
    const [inputValue, setInputValue] = useState<string>('');
    const [adding, setAdding] = useState(false);
    
    const percentage = Math.min(100, Math.max(0, (current / goal) * 100));
    
    const bubbles = Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        size: Math.random() * 8 + 6,
        left: Math.random() * 80 + 10,
        delay: Math.random() * 2,
        duration: Math.random() * 2 + 3,
    }));

    const topOffset = 100 - percentage;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseInt(inputValue, 10);
        if (!isNaN(amount) && amount > 0) {
            setAdding(true);
            onAddWater(amount);
            setInputValue('');
            setTimeout(() => setAdding(false), 1000);
        }
    };

    return (
        <div className="bento-card h-full w-full flex flex-col md:flex-row items-center justify-center md:justify-around gap-8 md:gap-12 bg-gradient-to-br from-blue-50 to-cyan-50 border-none overflow-hidden relative">
            {/* The Cylinder */}
            <div className="relative z-10 flex flex-col items-center flex-1 w-full max-w-[200px]">
                <h3 className="font-black text-xl mb-6 text-slate-800 uppercase tracking-widest drop-shadow-sm flex items-center gap-2">
                    <Droplets className="text-blue-500" /> Hydration
                </h3>
                
                {/* Tall Pill Container */}
                <div className="relative shrink-0 rounded-[4rem] border-8 border-white bg-slate-200 shadow-[inset_0_4px_12px_rgba(0,0,0,0.1),0_20px_40px_-10px_rgba(0,0,0,0.1)] flex flex-col items-center justify-end overflow-hidden z-10 transition-transform hover:scale-[1.02] duration-500 w-[140px] h-[340px] md:h-[400px]">
                    
                    {/* Glass glare */}
                    <div className="absolute top-4 left-4 w-4 h-[80%] rounded-full bg-white/40 z-20 mix-blend-overlay pointer-events-none blur-[2px]" />

                    {/* Liquid Body */}
                    <motion.div 
                        className="absolute inset-x-0 bottom-0 z-0 origin-bottom w-[150%] left-[-25%]"
                        initial={{ height: "0%" }}
                        animate={{ height: `${percentage}%` }}
                        transition={{ type: "spring", stiffness: 30, damping: 12 }}
                    >
                        {/* Deep water gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-600 via-blue-500 to-cyan-400 opacity-95" />
                        
                        {/* Animated Surface Waves */}
                        <motion.div 
                            className="absolute bg-white/20 mix-blend-overlay"
                            style={{ width: '200%', height: '300px', borderRadius: '42%', top: '-150px', left: '-50%' }}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
                        />
                        <motion.div 
                            className="absolute bg-cyan-200/30 mix-blend-overlay"
                            style={{ width: '200%', height: '300px', borderRadius: '45%', top: '-140px', left: '-50%' }}
                            animate={{ rotate: -360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        />

                        {/* Bubbles */}
                        {bubbles.map(b => (
                            <motion.div
                                key={b.id}
                                className="absolute bottom-0 rounded-full bg-white/40 shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                                style={{ width: b.size, height: b.size, left: `${b.left}%`, bottom: '-10px' }}
                                animate={{
                                    y: [0, -400],
                                    opacity: [0, 1, 0],
                                    x: [0, Math.random() * 40 - 20, Math.random() * 40 - 20]
                                }}
                                transition={{
                                    duration: b.duration, repeat: Infinity, delay: b.delay, ease: "linear"
                                }}
                            />
                        ))}
                    </motion.div>

                    {/* Center Numbers */}
                    <div className={`relative z-30 flex flex-col items-center justify-center h-full pointer-events-none transition-colors duration-500 ${percentage > 50 ? 'text-white' : 'text-slate-800'}`}>
                        <h4 className="text-4xl font-black tracking-tighter mb-0 leading-none drop-shadow-md">{current}</h4>
                        <p className="text-sm font-bold uppercase tracking-widest mt-1 opacity-80">/ {goal} {unit}</p>
                    </div>

                    {/* Flash when adding */}
                    <AnimatePresence>
                        {adding && (
                            <motion.div 
                                className="absolute inset-0 bg-white/60 z-40 pointer-events-none mix-blend-overlay"
                                initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} exit={{ opacity: 0 }}
                                transition={{ duration: 0.6 }}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Manual Input Form */}
            <div className="flex flex-col w-full md:w-64 z-10 shrink-0">
                <div className="bg-white p-6 rounded-[2rem] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] border border-slate-100">
                    <label className="block text-sm text-slate-400 font-bold tracking-widest uppercase mb-4 text-center md:text-left">Add Water</label>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="relative flex items-center">
                            <input 
                                type="number" min="1" max="4000" required
                                value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                                placeholder="e.g. 500" 
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-6 pr-16 text-slate-800 text-2xl font-black outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300 placeholder:font-bold"
                            />
                            <span className="absolute right-5 text-slate-400 font-bold uppercase">ml</span>
                        </div>
                        <button 
                            type="submit"
                            disabled={!inputValue || parseFloat(inputValue) <= 0}
                            className="w-full btn-bento shadow-[0_10px_20px_-10px_rgba(59,130,246,0.6)] bg-blue-600 hover:bg-blue-700 hover:-translate-y-1 active:scale-95 text-white disabled:opacity-50 disabled:hover:translate-y-0"
                        >
                            <Plus size={24} strokeWidth={3} />
                            Log Drink
                        </button>
                    </form>
                </div>
            </div>
            
            {/* Background Blob */}
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-400/20 blur-[80px] rounded-full pointer-events-none z-0" />
        </div>
    );
};

export default WaterBowl;
