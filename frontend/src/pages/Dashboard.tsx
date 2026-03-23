import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Flame, Calendar, Trophy, Plus, CheckCircle2, Search, User as UserIcon, Activity, Moon, X, ChevronRight, Apple } from 'lucide-react';
import axios from 'axios';
import WaterBowl from '../components/WaterBowl';
import { AnimatedLogButton } from '../components/AnimatedLogButton';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const Dashboard = () => {
    const { user } = useAuth();
    // Daily Stats
    const [water, setWater] = useState(0);
    const [steps, setSteps] = useState(0);
    const [sleepHours, setSleepHours] = useState(0);
    const [caloriesBurned, setCaloriesBurned] = useState(0);
    const [caloriesConsumed, setCaloriesConsumed] = useState(0);

    // Other State
    const [searchResults, setSearchResults] = useState([]);
    const [exercises, setExercises] = useState<any[]>([]);
    
    // Quick Log Modal State
    const [activeModal, setActiveModal] = useState<'NONE' | 'QUICK_LOG' | 'WATER_LOGS'>('NONE');
    const [logType, setLogType] = useState<'WATER' | 'STEPS' | 'SLEEP' | 'FOOD' | 'WORKOUT'>('WATER');
    
    // Form States
    const [loading, setLoading] = useState(false);
    const [newWater, setNewWater] = useState<number | ''>('');
    const [newSteps, setNewSteps] = useState<number | ''>('');
    const [newSleep, setNewSleep] = useState<number | ''>('');
    const [foodData, setFoodData] = useState({ name: '', calories: 0 });
    const [workoutData, setWorkoutData] = useState({
        exerciseId: '',
        type: 'GYM' as 'GYM' | 'RUNNING' | 'CUSTOM',
        sets: 0,
        reps: 0,
        weight: 0,
        duration: 30,
        caloriesBurned: 0
    });

    const [waterLogs, setWaterLogs] = useState<any[]>([]);
    const [waterHistoryAgg, setWaterHistoryAgg] = useState<any[]>([]);

    const waterGoal = user?.waterGoal || 3000;
    const stepGoal = 10000; // Hardcoded for demo, could be from user settings
    const sleepGoal = 8;
    const calorieGoal = 2500;

    useEffect(() => {
        fetchExercises();
        fetchDailyHealth();
        fetchWaterData();
    }, []);

    const fetchWaterData = async () => {
        try {
            const res = await axios.get('/api/habits/water');
            setWaterLogs(res.data.todayLogs || []);
            setWaterHistoryAgg(res.data.history || []);
            const todaySum = (res.data.todayLogs || []).reduce((acc: number, log: any) => acc + log.amount, 0);
            setWater(todaySum);
        } catch (err) {
            console.error('Error fetching water', err);
        }
    };

    const fetchDailyHealth = async () => {
        try {
            const res = await axios.get('/api/health/daily');
            setWater(res.data.water || 0);
            setSteps(res.data.steps || 0);
            setSleepHours(res.data.sleepHours || 0);
            setCaloriesBurned(res.data.caloriesBurned || 0);
            setCaloriesConsumed(res.data.caloriesConsumed || 0);
        } catch (err) {
            console.error('Error fetching daily health', err);
        }
    };

    const handleQuickLog = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            if (logType === 'WATER' && newWater) {
                if (newWater < 10 || newWater > 4000) return alert('Enter amount between 10ml - 4000ml');
                await axios.post('/api/habits/water', { amount: newWater });
                setNewWater('');
                fetchWaterData();
            } else if (logType === 'STEPS' && newSteps) {
                await axios.post('/api/health/daily', { steps: steps + Number(newSteps) });
                setSteps(prev => prev + Number(newSteps));
                setNewSteps('');
            } else if (logType === 'SLEEP' && newSleep) {
                await axios.post('/api/health/daily', { sleepHours: sleepHours + Number(newSleep) });
                setSleepHours(prev => prev + Number(newSleep));
                setNewSleep('');
            } else if (logType === 'FOOD' && foodData.name && foodData.calories) {
                await axios.post('/api/health/daily', { foodItem: foodData });
                setCaloriesConsumed(prev => prev + foodData.calories);
                setFoodData({ name: '', calories: 0 });
            } else if (logType === 'WORKOUT') {
                const selectedExercise = exercises.find(ex => ex._id === workoutData.exerciseId);
                const data = { ...workoutData, activityName: selectedExercise?.name || 'Workout' };
                await axios.post('/api/habits/workout', data);
                
                const restDuration = selectedExercise?.defaultRestTime || user?.restTimerSettings?.defaultDuration || 90;
                window.dispatchEvent(new CustomEvent('startRestTimer', {
                    detail: { duration: restDuration, exerciseName: selectedExercise?.name, autoStart: true }
                }));
                
                setCaloriesBurned(prev => prev + (workoutData.caloriesBurned || 0));
                setTimeout(() => alert('Workout logged! Rest timer started.'), 300);
            }
            
            setActiveModal('NONE');
        } catch (err) {
            console.error('Error logging', err);
            alert('Failed to save log.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddWater = async (amount: number) => {
        try {
            await axios.post('/api/habits/water', { amount });
            fetchWaterData();
        } catch (err) {
            console.error('Failed to log water', err);
        }
    };

    const handleDeleteWater = async (id: string) => {
        try {
            await axios.delete(`/api/habits/water/${id}`);
            fetchWaterData();
        } catch (err) {
            alert('Failed to delete water log');
        }
    };

    const fetchExercises = async () => {
        try {
            const res = await axios.get('/api/exercises');
            setExercises(res.data);
        } catch (err) {
            console.error('Error fetching exercises', err);
        }
    };

    const handleShareProgress = async () => {
        try {
            const content = prompt("What's on your mind? Share your progress!");
            if (!content) return;
            await axios.post('/api/social/post', { content });
            alert('Progress shared successfully!');
        } catch (err) {
            console.error('Error sharing progress', err);
            alert('Failed to share progress');
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
    };

    const MetricCard = ({ title, value, target, unit, icon: Icon, colorClass, gradientClass, progress }: any) => {
        const percentage = Math.min(100, Math.max(0, (progress || (value / target) * 100) || 0));
        return (
            <motion.div variants={itemVariants} className="glass p-6 group hover:border-white/20 transition-all cursor-default">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl ${gradientClass} shadow-lg shadow-black/20`}>
                        <Icon className="text-white" size={24} />
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-medium text-text-muted">{title}</p>
                        <h3 className="text-2xl font-bold mt-1 tracking-tight">
                            {value} <span className="text-sm font-normal text-text-muted">{unit}</span>
                        </h3>
                    </div>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={`h-full ${gradientClass}`} 
                    />
                </div>
                {target && (
                    <p className="text-xs text-text-muted text-right mt-2 font-medium tracking-wide">
                        Goal: {target} {unit}
                    </p>
                )}
            </motion.div>
        );
    };

    return (
        <div className="pb-24 relative">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-8"
            >
                {/* Hero / Header Section */}
                <motion.div variants={itemVariants} className="md:col-span-12 glass overflow-hidden relative p-8">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-bold mb-2 font-black tracking-tight">Ready to crush it, {user?.name?.split(' ')[0] || 'Athlete'}? ⚡️</h1>
                            <p className="text-text-muted text-lg">You're on a <span className="text-accent font-bold">5 day streak</span>. Let's make it 6.</p>
                        </div>
                        <button
                            onClick={handleShareProgress}
                            className="bg-white/5 hover:bg-white/10 border border-white/10 transition-colors px-6 py-3 rounded-2xl font-semibold flex items-center justify-center gap-2"
                        >
                            Share Progress <ChevronRight size={18} />
                        </button>
                    </div>
                    {/* Decorative Blob */}
                    <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/20 blur-[120px] rounded-full pointer-events-none"></div>
                </motion.div>

                {/* Core Metrics Grid */}
                <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <WaterBowl current={water} goal={waterGoal} unit="ml" onAddWater={handleAddWater} />
                    <MetricCard 
                        title="Steps" value={steps} target={stepGoal} unit="steps" 
                        icon={CheckCircle2} gradientClass="bg-gradient-to-br from-green-400 to-emerald-600" 
                    />
                    <MetricCard 
                        title="Sleep" value={sleepHours} target={sleepGoal} unit="hrs" 
                        icon={Moon} gradientClass="bg-gradient-to-br from-indigo-400 to-purple-600" 
                    />
                    <MetricCard 
                        title="Net Calories" value={caloriesConsumed - caloriesBurned} target={calorieGoal} unit="kcal" 
                        icon={Flame} gradientClass="bg-gradient-to-br from-orange-400 to-red-500" 
                    />
                </div>

                {/* Main Activity Chart */}
                <motion.div variants={itemVariants} className="md:col-span-8 glass p-8">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Activity className="text-primary" size={20} /> Activity Peak
                    </h3>
                    <div className="h-[280px]">
                        <Line
                            data={{
                                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                                datasets: [{
                                    label: 'Activity Points',
                                    data: [65, 59, 80, 81, 56, 55, 40],
                                    fill: true,
                                    borderColor: 'rgb(139, 92, 246)',
                                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                                    tension: 0.4
                                }]
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                                    x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
                                }
                            }}
                        />
                    </div>
                </motion.div>

                {/* Quick Info Sidebar */}
                <motion.div variants={itemVariants} className="md:col-span-4 flex flex-col gap-6">
                    <div className="glass p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <Apple className="text-green-400" size={20} /> Calories Today
                            </h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                                <span className="text-text-muted font-medium">Consumed</span>
                                <span className="font-bold text-orange-300">{caloriesConsumed} kcal</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                                <span className="text-text-muted font-medium">Burned</span>
                                <span className="font-bold text-green-300">{caloriesBurned} kcal</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="glass p-6 flex-1 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Water Logs</h3>
                            <button onClick={() => setActiveModal('WATER_LOGS')} className="text-primary text-sm font-medium hover:underline">View All</button>
                        </div>
                        {waterLogs.length > 0 ? (
                            <div className="space-y-3 flex-1">
                                {waterLogs.slice(0, 3).map((log) => (
                                    <div key={log._id} className="flex items-center justify-between bg-white/5 p-3 rounded-xl text-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-blue-400" />
                                            <span className="font-medium">{log.amount} ml</span>
                                        </div>
                                        <span className="text-xs text-text-muted">{new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center flex-col text-text-muted opacity-50">
                                <Droplets size={32} className="mb-2" />
                                <p className="text-sm">No water logged yet.</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Search FitTrackers */}
                <motion.div variants={itemVariants} className="md:col-span-12 glass p-8 mb-12">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold flex items-center gap-2"><Search className="text-primary" size={20} /> Discover Users</h3>
                    </div>
                    <div className="relative mb-8">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-muted" size={20} />
                        <input
                            type="text"
                            placeholder="Search by username or name..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 outline-none focus:ring-2 focus:ring-primary text-lg transition-all"
                            onChange={async (e) => {
                                const val = e.target.value;
                                if (val.length > 2) {
                                    try {
                                        const res = await axios.get(`/api/users/search?query=${val}`);
                                        setSearchResults(res.data);
                                    } catch (err) { console.error(err); }
                                } else setSearchResults([]);
                            }}
                        />
                    </div>
                    
                    {searchResults.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {searchResults.map((result: any) => (
                                <div key={result.username} className="bg-white/5 p-4 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-colors border border-transparent hover:border-primary/50 cursor-pointer group">
                                    <div className="w-12 h-12 rounded-full bg-white/10 flex flex-shrink-0 items-center justify-center overflow-hidden">
                                        {result.profilePicture ? <img src={result.profilePicture} alt="" className="w-full h-full object-cover" /> : <UserIcon size={20} className="text-text-muted" />}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold group-hover:text-primary transition-colors truncate">{result.name}</p>
                                        <p className="text-xs text-text-muted truncate">@{result.username}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-text-muted bg-white/5 rounded-2xl border border-dashed border-white/10">
                            Search for your friends to see their progress!
                        </div>
                    )}
                </motion.div>
            </motion.div>

            {/* Quick Log Floating FAB */}
            <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="fixed bottom-8 right-8 z-40"
            >
                <button 
                    onClick={() => setActiveModal('QUICK_LOG')}
                    className="w-16 h-16 rounded-full bg-primary text-white shadow-lg shadow-primary/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                >
                    <Plus size={32} />
                </button>
            </motion.div>

            {/* Unified Modal System */}
            <AnimatePresence>
                {activeModal !== 'NONE' && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-background/80 backdrop-blur-md">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="glass overflow-hidden w-full max-w-lg shadow-2xl relative"
                        >
                            {/* Modal Header */}
                            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
                                <h2 className="text-xl font-bold">
                                    {activeModal === 'QUICK_LOG' ? 'Quick Log' : 'Water History'}
                                </h2>
                                <button onClick={() => setActiveModal('NONE')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            {activeModal === 'QUICK_LOG' && (
                                <div className="p-6">
                                    {/* Type Selector */}
                                    <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar mb-4">
                                        {[
                                            { id: 'WATER', icon: Droplets, label: 'Water' },
                                            { id: 'STEPS', icon: CheckCircle2, label: 'Steps' },
                                            { id: 'SLEEP', icon: Moon, label: 'Sleep' },
                                            { id: 'FOOD', icon: Apple, label: 'Food' },
                                            { id: 'WORKOUT', icon: Activity, label: 'Workout' }
                                        ].map(type => (
                                            <button
                                                key={type.id}
                                                onClick={() => setLogType(type.id as any)}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${logType === type.id ? 'bg-primary text-white' : 'bg-white/5 text-text-muted hover:text-white hover:bg-white/10'}`}
                                            >
                                                <type.icon size={16} /> {type.label}
                                            </button>
                                        ))}
                                    </div>

                                    <form onSubmit={handleQuickLog} className="space-y-6">
                                        <AnimatePresence mode="wait">
                                            <motion.div 
                                                key={logType}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 10 }}
                                                className="min-h-[120px]"
                                            >
                                                {/* Form Fields Based on Type */}
                                                {logType === 'WATER' && (
                                                    <div>
                                                        <label className="block text-sm text-text-muted mb-2">Amount (ml)</label>
                                                        <input autoFocus type="number" placeholder="e.g. 250" value={newWater} onChange={(e) => setNewWater(Number(e.target.value) || '')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary text-lg" />
                                                    </div>
                                                )}
                                                {logType === 'STEPS' && (
                                                    <div>
                                                        <label className="block text-sm text-text-muted mb-2">Steps Taken</label>
                                                        <input autoFocus type="number" placeholder="e.g. 5000" value={newSteps} onChange={(e) => setNewSteps(Number(e.target.value) || '')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary text-lg" />
                                                    </div>
                                                )}
                                                {logType === 'SLEEP' && (
                                                    <div>
                                                        <label className="block text-sm text-text-muted mb-2">Hours Slept</label>
                                                        <input autoFocus type="number" step="0.5" placeholder="e.g. 7.5" value={newSleep} onChange={(e) => setNewSleep(Number(e.target.value) || '')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary text-lg" />
                                                    </div>
                                                )}
                                                {logType === 'FOOD' && (
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="col-span-2 sm:col-span-1">
                                                            <label className="block text-sm text-text-muted mb-2">Item Name</label>
                                                            <input autoFocus type="text" placeholder="e.g. Banana" value={foodData.name} onChange={(e) => setFoodData({...foodData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary" />
                                                        </div>
                                                        <div className="col-span-2 sm:col-span-1">
                                                            <label className="block text-sm text-text-muted mb-2">Calories</label>
                                                            <input type="number" placeholder="e.g. 105" value={foodData.calories || ''} onChange={(e) => setFoodData({...foodData, calories: Number(e.target.value) || 0})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary" />
                                                        </div>
                                                    </div>
                                                )}
                                                {logType === 'WORKOUT' && (
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="block text-sm text-text-muted mb-2">Select Exercise</label>
                                                            <select required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary" value={workoutData.exerciseId} onChange={(e) => setWorkoutData({ ...workoutData, exerciseId: e.target.value })}>
                                                                <option value="" disabled>Choose an exercise...</option>
                                                                {exercises.map(ex => (
                                                                    <option key={ex._id} value={ex._id}>{ex.name} ({ex.category})</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-3">
                                                            <div>
                                                                <label className="block text-xs text-text-muted mb-1">Sets</label>
                                                                <input type="number" placeholder="0" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 outline-none" value={workoutData.sets} onChange={(e) => setWorkoutData({ ...workoutData, sets: parseInt(e.target.value) || 0 })} />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs text-text-muted mb-1">Reps</label>
                                                                <input type="number" placeholder="0" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 outline-none" value={workoutData.reps} onChange={(e) => setWorkoutData({ ...workoutData, reps: parseInt(e.target.value) || 0 })} />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs text-text-muted mb-1">Wt (kg)</label>
                                                                <input type="number" placeholder="0" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 outline-none" value={workoutData.weight} onChange={(e) => setWorkoutData({ ...workoutData, weight: parseInt(e.target.value) || 0 })} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </motion.div>
                                        </AnimatePresence>

                                        {/* Submit Action */}
                                        {logType === 'WORKOUT' ? (
                                            <AnimatedLogButton 
                                                onComplete={() => handleQuickLog()} 
                                                isSubmitting={loading} 
                                                label="Hold to Log Workout" 
                                                logType="WORKOUT" 
                                            />
                                        ) : (
                                            <button type="submit" disabled={loading} className="w-full btn-primary py-4 text-lg">
                                                {loading ? 'Saving...' : `Log ${logType.charAt(0) + logType.slice(1).toLowerCase()}`}
                                            </button>
                                        )}
                                    </form>
                                </div>
                            )}

                            {activeModal === 'WATER_LOGS' && (
                                <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-3">
                                    {waterLogs.length === 0 ? (
                                        <p className="text-center text-text-muted">No water logged today.</p>
                                    ) : (
                                        waterLogs.map((log) => (
                                            <div key={log._id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white/5 p-4 rounded-xl gap-4">
                                                <div className="flex items-center gap-4 text-lg">
                                                    <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><Droplets size={20} /></div>
                                                    <span className="font-bold">{log.amount} ml</span>
                                                    <span className="text-sm font-normal text-text-muted">{new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <button onClick={() => handleDeleteWater(log._id)} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                                    Delete
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;
