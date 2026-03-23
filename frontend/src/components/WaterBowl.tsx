import React from 'react';
import { motion } from 'framer-motion';
import { Droplets } from 'lucide-react';

interface WaterBowlProps {
    current: number;
    goal: number;
    unit: string;
}

const WaterBowl: React.FC<WaterBowlProps> = ({ current, goal, unit }) => {
    const percentage = Math.min(100, Math.max(0, (current / goal) * 100));
    
    // Generate some random bubbles
    const bubbles = Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        size: Math.random() * 6 + 4,
        left: Math.random() * 80 + 10,
        delay: Math.random() * 3,
        duration: Math.random() * 2 + 2,
    }));

    // Calculate translate Y based on percentage. 100% = 0px, 0% = 200px
    const topOffset = 100 - percentage;

    return (
        <div className="glass p-6 flex flex-col items-center justify-center relative overflow-hidden group">
            <h3 className="font-bold text-lg mb-6 z-10 text-white/90">Hydration</h3>
            
            {/* The Bowl */}
            <div className="relative w-40 h-40 rounded-full border-[6px] border-white/10 bg-black/40 shadow-[inset_0_-10px_20px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center overflow-hidden z-10">
                
                {/* Glossy Reflection overlay */}
                <div className="absolute inset-x-2 top-2 h-1/3 bg-gradient-to-b from-white/20 to-transparent rounded-full z-20 pointer-events-none" />

                {/* The Liquid Container */}
                <motion.div 
                    className="absolute inset-0 z-0"
                    initial={{ y: "100%" }}
                    animate={{ y: `${topOffset}%` }}
                    transition={{ type: "spring", stiffness: 40, damping: 15 }}
                >
                    {/* The Base Liquid Background */}
                    <div className="absolute top-0 w-full h-[200%] bg-gradient-to-t from-blue-600 to-cyan-400 opacity-90" />
                    
                    {/* The Wave 1 (Back) */}
                    <div className="absolute -top-[150%] -left-[50%] w-[200%] aspect-square rounded-[40%] bg-blue-500/30 animate-[spin_8s_linear_infinite]" />
                    
                    {/* The Wave 2 (Front) */}
                    <div className="absolute -top-[140%] -left-[50%] w-[200%] aspect-square rounded-[43%] bg-cyan-400/30 animate-[spin_11s_linear_infinite_reverse]" />

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
                                y: ['0px', '-180px'],
                                opacity: [0, 1, 0],
                                x: [0, Math.random() * 30 - 15, Math.random() * 30 - 15]
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
                <div className="z-30 flex flex-col items-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mt-2">
                    <Droplets className="text-cyan-300 mb-1" size={24} />
                    <h4 className="text-3xl font-black tracking-tight text-white mb-0 leading-none">{current}</h4>
                    <p className="text-xs font-bold text-cyan-200">/ {goal} {unit}</p>
                </div>
            </div>
            
            {/* Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-cyan-500/20 blur-[50px] pointer-events-none -z-10" />
        </div>
    );
};

export default WaterBowl;
