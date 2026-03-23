import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Activity, Droplets, CheckCircle2, Moon, Apple } from 'lucide-react';

interface AnimatedLogButtonProps {
    onComplete: () => void;
    isSubmitting: boolean;
    label: string;
    logType: 'WATER' | 'STEPS' | 'SLEEP' | 'FOOD' | 'WORKOUT';
}

const icons = {
    WATER: Droplets,
    STEPS: CheckCircle2,
    SLEEP: Moon,
    FOOD: Apple,
    WORKOUT: Activity
};

const gradients = {
    WATER: 'bg-gradient-to-r from-blue-500 to-cyan-400',
    STEPS: 'bg-gradient-to-r from-emerald-500 to-green-400',
    SLEEP: 'bg-gradient-to-r from-indigo-500 to-purple-400',
    FOOD: 'bg-gradient-to-r from-orange-500 to-red-400',
    WORKOUT: 'bg-gradient-to-r from-accent to-pink-500' // Using accent color for workout
};

export const AnimatedLogButton: React.FC<AnimatedLogButtonProps> = ({ onComplete, isSubmitting, label, logType }) => {
    const [progress, setProgress] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const Icon = icons[logType];
    const fillGradient = gradients[logType];

    const handlePointerDown = () => {
        if (isSubmitting || isComplete) return;
        intervalRef.current = setInterval(() => {
            setProgress(p => {
                if (p >= 100) {
                    clearInterval(intervalRef.current!);
                    setIsComplete(true);
                    onComplete();
                    // Reset after 2s
                    setTimeout(() => {
                        setIsComplete(false);
                        setProgress(0);
                    }, 2000);
                    return 100;
                }
                return p + 3.5; // Takes roughly ~400ms to fill
            });
        }, 16);
    };

    const handlePointerUp = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (!isComplete && !isSubmitting) {
            setProgress(0);
        }
    };

    return (
        <div 
            className="relative w-full h-16 bg-white/5 border border-white/10 rounded-2xl overflow-hidden cursor-pointer touch-none select-none group transition-transform active:scale-95"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onTouchEnd={handlePointerUp}
            onContextMenu={e => e.preventDefault()}
        >
            {/* The fill progress */}
            <motion.div 
                className={`absolute left-0 top-0 bottom-0 z-0 ${fillGradient}`}
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.1, ease: 'linear' }}
            />
            
            {/* Text Overlay */}
            <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 pointer-events-none text-lg font-bold tracking-tight shadow-black/50 drop-shadow-md">
                {isSubmitting ? 'Logging...' : isComplete ? 'Boom! Logged! 💥' : label}
                {!isSubmitting && !isComplete && <Icon size={20} className="text-white/80 group-hover:scale-110 transition-transform" />}
            </div>

            {/* Confetti Explosion (rendered when complete) */}
            {isComplete && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
                    {Array.from({ length: 40 }).map((_, i) => (
                        <motion.div
                            key={i}
                            className={`absolute w-3 h-3 rounded-md ${['bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-purple-400', 'bg-pink-400'][i % 6]}`}
                            initial={{ scale: 0, x: 0, y: 0, rotate: 0 }}
                            animate={{ 
                                scale: [0, 1.5, 0],
                                x: (Math.random() - 0.5) * 400,
                                y: (Math.random() - 0.5) * 400,
                                rotate: Math.random() * 360
                            }}
                            transition={{ duration: 0.8, ease: "circOut" }}
                        />
                    ))}
                    <motion.div
                        className="absolute w-64 h-64 rounded-full bg-white opacity-20 pointer-events-none"
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1, 1.5], opacity: [0.8, 0] }}
                        transition={{ duration: 0.4 }}
                    />
                </div>
            )}
        </div>
    );
};
