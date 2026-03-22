import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, X, Play, Pause, RotateCcw, Plus } from 'lucide-react';

interface RestTimerProps {
    onClose?: () => void;
}

const RestTimer: React.FC<RestTimerProps> = () => {
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [initialTime, setInitialTime] = useState(90);
    const [isActive, setIsActive] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    // Listen for custom event to start timer
    useEffect(() => {
        const handleStartTimer = (e: any) => {
            const duration = e.detail?.duration || 90;
            const autoStart = e.detail?.autoStart !== false;
            
            setInitialTime(duration);
            setTimeLeft(duration);
            if (autoStart) setIsActive(true);
            setIsMinimized(false);
            
            // Persist to session
            sessionStorage.setItem('restTimer', JSON.stringify({ 
                timeLeft: duration, 
                isActive: autoStart, 
                endTime: autoStart ? Date.now() + duration * 1000 : null 
            }));
        };

        window.addEventListener('startRestTimer', handleStartTimer);
        return () => window.removeEventListener('startRestTimer', handleStartTimer);
    }, []);

    // Load from sessionStorage on mount
    useEffect(() => {
        const saved = sessionStorage.getItem('restTimer');
        if (saved) {
            const { timeLeft: savedLeft, isActive: savedActive, endTime } = JSON.parse(saved);
            if (savedActive && endTime > Date.now()) {
                const remaining = Math.round((endTime - Date.now()) / 1000);
                setTimeLeft(remaining);
                setIsActive(true);
            } else if (!savedActive) {
                setTimeLeft(savedLeft);
                setIsActive(false);
            }
        }
    }, []);

    useEffect(() => {
        if (isActive && timeLeft !== null && timeLeft > 0) {
            timerRef.current = setTimeout(() => {
                setTimeLeft(prev => (prev !== null ? prev - 1 : null));
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            handleTimerComplete();
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [isActive, timeLeft]);

    const handleTimerComplete = () => {
        setIsActive(false);
        playAlert();
        sessionStorage.removeItem('restTimer');
        
        // Visual flash (could be handled via a global state or simple CSS class on body)
        document.body.classList.add('timer-flash');
        setTimeout(() => document.body.classList.remove('timer-flash'), 2000);
    };

    const playAlert = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        
        const ctx = audioContextRef.current;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, ctx.currentTime); // A5
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start();
        oscillator.stop(ctx.currentTime + 1);
    };

    const toggleTimer = () => setIsActive(!isActive);
    
    const resetTimer = () => {
        setTimeLeft(initialTime);
        setIsActive(false);
        sessionStorage.removeItem('restTimer');
    };

    const addSeconds = (secs: number) => {
        setTimeLeft(prev => (prev !== null ? prev + secs : secs));
    };

    const closeTimer = () => {
        setTimeLeft(null);
        setIsActive(false);
        sessionStorage.removeItem('restTimer');
    };

    if (timeLeft === null) return null;

    const progress = (timeLeft / initialTime) * 100;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm glass-card border-primary/30 p-4 transition-all ${isMinimized ? 'h-16 overflow-hidden' : ''}`}
            >
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Timer size={18} className="text-primary anim-pulse" />
                        <span className="font-bold">Rest Timer</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <button onClick={() => setIsMinimized(!isMinimized)} className="p-1 hover:bg-white/10 rounded">
                            {isMinimized ? <Plus size={16} /> : <X size={16} onClick={closeTimer} />}
                        </button>
                    </div>
                </div>

                {!isMinimized && (
                    <div className="space-y-4">
                        <div className="flex flex-col items-center justify-center py-4">
                            <div className="relative w-32 h-32 flex items-center justify-center">
                                <svg className="absolute inset-0 w-full h-full -rotate-90">
                                    <circle
                                        cx="64" cy="64" r="60"
                                        className="stroke-white/10 fill-none"
                                        strokeWidth="8"
                                    />
                                    <circle
                                        cx="64" cy="64" r="60"
                                        className="stroke-primary fill-none transition-all duration-1000"
                                        strokeWidth="8"
                                        strokeDasharray={377}
                                        strokeDashoffset={377 - (377 * progress) / 100}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <span className="text-4xl font-black text-white">
                                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-4">
                            <button onClick={resetTimer} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                                <RotateCcw size={20} />
                            </button>
                            <button 
                                onClick={toggleTimer}
                                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary-dark'}`}
                            >
                                {isActive ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                            </button>
                            <button onClick={() => addSeconds(30)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                                <Plus size={20} />
                                <span className="text-[10px] absolute -mt-1 ml-4">+30s</span>
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );
};

export default RestTimer;
