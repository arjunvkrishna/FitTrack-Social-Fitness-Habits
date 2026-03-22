import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, ChevronLeft, Play, Save, Clock, Activity, Weight, Hash } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface TemplateExercise {
    exerciseId: {
        _id: string;
        name: string;
        category: string;
        defaultRestTime?: number;
    } | string;
    targetSets: number;
    targetReps: number;
    targetWeight: number;
}

interface WorkoutTemplate {
    _id: string;
    name: string;
    exercises: TemplateExercise[];
}

interface ActiveSet {
    completed: boolean;
    reps: number;
    weight: number;
}

interface ActiveExercise {
    exerciseId: string;
    name: string;
    targetSets: number;
    targetReps: number;
    targetWeight: number;
    defaultRestTime?: number;
    sets: ActiveSet[];
    completedSets: number;
}

const ActiveWorkout = () => {
    const { templateId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [template, setTemplate] = useState<WorkoutTemplate | null>(null);
    const [activeExercises, setActiveExercises] = useState<ActiveExercise[]>([]);
    const [loading, setLoading] = useState(true);
    const [startTime] = useState(new Date());
    const [elapsedTime, setElapsedTime] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setElapsedTime(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
        }, 1000);
        return () => clearInterval(timer);
    }, [startTime]);

    useEffect(() => {
        const fetchTemplate = async () => {
            try {
                const res = await axios.get(`/api/workout-templates/${templateId}`);
                const t = res.data;
                setTemplate(t);
                
                // Initialize active exercises with target sets and populated exercise info
                const initial: ActiveExercise[] = t.exercises.map((ex: any) => {
                    const exerciseInfo = typeof ex.exerciseId === 'object' ? ex.exerciseId : { name: 'Unknown', _id: ex.exerciseId };
                    return {
                        exerciseId: exerciseInfo._id,
                        name: exerciseInfo.name,
                        defaultRestTime: exerciseInfo.defaultRestTime,
                        targetSets: ex.targetSets,
                        targetReps: ex.targetReps,
                        targetWeight: ex.targetWeight,
                        sets: Array.from({ length: ex.targetSets }, () => ({
                            completed: false,
                            reps: ex.targetReps,
                            weight: ex.targetWeight
                        })),
                        completedSets: 0
                    };
                });
                setActiveExercises(initial);
            } catch (err) {
                console.error('Error fetching template', err);
                alert('Failed to load template.');
                navigate('/templates');
            } finally {
                setLoading(false);
            }
        };
        fetchTemplate();
    }, [templateId, navigate]);

    const handleLogSet = async (exIdx: number, setIdx: number) => {
        const ex = activeExercises[exIdx];
        const set = ex.sets[setIdx];
        
        if (set.completed) return;

        try {
            // Log to backend
            await axios.post('/api/habits/workout', {
                exerciseId: ex.exerciseId,
                activityName: ex.name,
                type: 'GYM',
                sets: 1,
                reps: set.reps,
                weight: set.weight,
                duration: 0
            });

            // Update UI
            const newExercises = [...activeExercises];
            newExercises[exIdx].sets[setIdx].completed = true;
            newExercises[exIdx].completedSets += 1;
            setActiveExercises(newExercises);

            // Trigger rest timer
            const restDuration = ex.defaultRestTime || user?.restTimerSettings?.defaultDuration || 90;
            window.dispatchEvent(new CustomEvent('startRestTimer', {
                detail: {
                    duration: restDuration,
                    exerciseName: ex.name,
                    autoStart: user?.restTimerSettings?.autoStart ?? true
                }
            }));

        } catch (err) {
            console.error('Error logging set', err);
            alert('Failed to log set.');
        }
    };

    const updateSetData = (exIdx: number, setIdx: number, field: 'reps' | 'weight', value: number) => {
        const newExercises = [...activeExercises];
        (newExercises[exIdx].sets[setIdx] as any)[field] = value;
        setActiveExercises(newExercises);
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
    if (!template) return null;

    return (
        <div className="max-w-4xl mx-auto pb-24">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 sticky top-0 bg-background/80 backdrop-blur-md z-10 py-4">
                <button onClick={() => navigate('/templates')} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                    <ChevronLeft size={24} />
                </button>
                <div className="text-center">
                    <h1 className="text-2xl font-bold">{template.name}</h1>
                    <div className="flex items-center gap-2 text-text-muted text-sm justify-center">
                        <Clock size={14} />
                        <span>{formatTime(elapsedTime)}</span>
                    </div>
                </div>
                <div className="w-10"></div> {/* Spacer */}
            </div>

            {/* Exercises List */}
            <div className="space-y-6">
                {activeExercises.map((ex, exIdx) => (
                    <motion.div 
                        key={exIdx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: exIdx * 0.1 }}
                        className="glass p-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Activity className="text-primary" size={20} />
                                {ex.name}
                            </h2>
                            <span className="text-sm text-text-muted">
                                {ex.completedSets} / {ex.targetSets} sets done
                            </span>
                        </div>

                        <div className="space-y-3">
                            <div className="grid grid-cols-4 gap-4 px-4 text-[10px] text-text-muted font-bold uppercase tracking-widest">
                                <span>Set</span>
                                <span>Weight (kg)</span>
                                <span>Reps</span>
                                <span className="text-right">Log</span>
                            </div>
                            
                            {ex.sets.map((set, setIdx) => (
                                <div 
                                    key={setIdx} 
                                    className={`grid grid-cols-4 gap-4 items-center p-3 rounded-xl transition-all ${
                                        set.completed ? 'bg-primary/10 border-primary/20' : 'bg-white/5 border-white/10'
                                    } border`}
                                >
                                    <span className="font-bold text-lg ml-2">{setIdx + 1}</span>
                                    
                                    <div className="flex items-center gap-2 bg-black/20 rounded-lg px-2">
                                        <Weight size={14} className="text-text-muted" />
                                        <input 
                                            type="number" 
                                            className="w-full bg-transparent py-1.5 text-sm outline-none"
                                            value={set.weight}
                                            disabled={set.completed}
                                            onChange={(e) => updateSetData(exIdx, setIdx, 'weight', parseInt(e.target.value) || 0)}
                                        />
                                    </div>

                                    <div className="flex items-center gap-2 bg-black/20 rounded-lg px-2">
                                        <Hash size={14} className="text-text-muted" />
                                        <input 
                                            type="number" 
                                            className="w-full bg-transparent py-1.5 text-sm outline-none"
                                            value={set.reps}
                                            disabled={set.completed}
                                            onChange={(e) => updateSetData(exIdx, setIdx, 'reps', parseInt(e.target.value) || 0)}
                                        />
                                    </div>

                                    <div className="flex justify-end">
                                        <button 
                                            onClick={() => handleLogSet(exIdx, setIdx)}
                                            className={`p-2 rounded-lg transition-all ${
                                                set.completed 
                                                ? 'bg-primary text-white' 
                                                : 'bg-white/10 hover:bg-primary/20 text-text-muted hover:text-primary'
                                            }`}
                                        >
                                            {set.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Bottom Panel */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-20">
                <button 
                    onClick={() => {
                        if (confirm('Finish workout session?')) {
                            navigate('/');
                        }
                    }}
                    className="w-full btn-primary py-4 rounded-2xl shadow-2xl flex items-center justify-center gap-2 text-lg"
                >
                    <Save size={24} />
                    Finish Workout
                </button>
            </div>
        </div>
    );
};

export default ActiveWorkout;
