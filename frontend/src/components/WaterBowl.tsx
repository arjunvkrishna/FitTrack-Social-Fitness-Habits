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
    
    const bubbles = Array.from({ length: 15 }).map((_, i) => ({
        id: i,
        size: Math.random() * 6 + 4,
        left: Math.random() * 80 + 10,
        delay: Math.random() * 2,
        duration: Math.random() * 1.5 + 2,
    }));

    // 100% means top is at 0%. 0% means top is at 100%.
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
        <div className="glass p-6 md:col-span-2 lg:col-span-2 flex flex-col md:flex-row items-center justify-center md:justify-around gap-8 relative">
            {/* The Bowl */}
            <div className="flex flex-col items-center justify-center">
                <h3 className="font-bold text-xl mb-6 z-10 text-white drop-shadow-md tracking-wider uppercase">Hydration</h3>
                
                {/* Fixed dimensions to absolutely prevent flex squishing */}
                <div 
                    style={{ width: '240px', height: '240px' }}
                    className="relative shrink-0 rounded-full border-[6px] border-white/10 bg-black/40 shadow-[inset_0_-10px_20px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center overflow-hidden z-10 transition-transform hover:scale-[1.02] duration-300"
                >
                    {/* Glossy top highlight */}
                    <div className="absolute inset-x-6 top-2 h-1/4 bg-gradient-to-b from-white/30 to-transparent rounded-full z-20 pointer-events-none" />

                    {/* Liquid Level Container */}
                    <motion.div 
                        className="absolute inset-0 z-0 origin-bottom"
                        initial={{ y: "100%" }}
                        animate={{ y: `${topOffset}%` }}
                        transition={{ type: "spring", stiffness: 40, damping: 15 }}
                    >
                        {/* Deep water background */}
                        <div className="absolute inset-0 h-[200%] bg-gradient-to-t from-blue-700 to-cyan-400 opacity-90" />
                        
                        {/* Spinning Waves using Framer Motion instead of arbitrary Tailwind classes */}
                        <motion.div 
                            className="absolute bg-blue-500/40 mix-blend-screen"
                            style={{ width: '200%', height: '200%', borderRadius: '42%', top: '-10%', left: '-50%' }}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        />
                        <motion.div 
                            className="absolute bg-cyan-300/30 mix-blend-screen"
                            style={{ width: '200%', height: '200%', borderRadius: '45%', top: '-5%', left: '-50%' }}
                            animate={{ rotate: -360 }}
                            transition={{ duration: 11, repeat: Infinity, ease: "linear" }}
                        />

                        {/* Bubbles */}
                        {bubbles.map(b => (
                            <motion.div
                                key={b.id}
                                className="absolute bottom-0 rounded-full bg-white/70 shadow-[0_0_4px_rgba(255,255,255,0.8)]"
                                style={{ width: b.size, height: b.size, left: `${b.left}%`, bottom: '-10px' }}
                                animate={{
                                    y: [0, -250],
                                    opacity: [0, 1, 0],
                                    x: [0, Math.random() * 30 - 15, Math.random() * 30 - 15]
                                }}
                                transition={{
                                    duration: b.duration, repeat: Infinity, delay: b.delay, ease: "easeIn"
                                }}
                            />
                        ))}
                    </motion.div>

                    {/* Centered Text Status */}
                    <div className="relative z-30 flex flex-col items-center mt-4 pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,1)] text-white">
                        <Droplets className="text-cyan-300 mb-2 drop-shadow-[0_0_8px_rgba(103,232,249,0.8)]" size={32} />
                        <h4 className="text-5xl font-black tracking-tighter mb-0 leading-none">{current}</h4>
                        <p className="text-sm font-bold text-cyan-200 uppercase tracking-widest mt-1">/ {goal} {unit}</p>
                    </div>

                    {/* Add-Flash overlay */}
                    <AnimatePresence>
                        {adding && (
                            <motion.div 
                                className="absolute inset-0 bg-white/30 z-40 pointer-events-none mix-blend-overlay"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0, 1, 0] }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.6 }}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Input Action Form */}
            <div className="flex flex-col gap-4 w-full md:w-64 z-10 mt-4 md:mt-0">
                <div className="flex flex-col">
                    <label className="text-sm text-cyan-200 font-bold tracking-widest uppercase mb-3 text-center md:text-left drop-shadow-md">Log Intake</label>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                        <div className="relative flex items-center">
                            <input 
                                type="number" 
                                min="1"
                                max="4000"
                                required
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Enter amount..." 
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-6 pr-16 text-white text-lg font-bold outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all placeholder:text-white/30"
                            />
                            <span className="absolute right-5 text-white/50 font-bold">{unit}</span>
                        </div>
                        <button 
                            type="submit"
                            disabled={!inputValue || parseFloat(inputValue) <= 0}
                            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)]"
                        >
                            <Plus size={20} strokeWidth={3} />
                            Add Water
                        </button>
                    </form>
                </div>
            </div>
            
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-600/10 blur-[100px] pointer-events-none -z-10" />
        </div>
    );
};

export default WaterBowl;
