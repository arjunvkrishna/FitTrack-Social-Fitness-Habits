import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Flame, Calendar, Trophy, Plus, CheckCircle2, Search, User as UserIcon, Activity, Moon, X, ChevronRight, Apple } from 'lucide-react';
import axios from 'axios';
import WaterBowl from '../components/WaterBowl';
import { AnimatedLogButton } from '../components/AnimatedLogButton';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

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
        exerciseId: '', type: 'GYM' as 'GYM' | 'RUNNING' | 'CUSTOM',
        sets: 0, reps: 0, weight: 0, duration: 30, caloriesBurned: 0
    });

    const [waterLogs, setWaterLogs] = useState<any[]>([]);
    const [waterHistoryAgg, setWaterHistoryAgg] = useState<any[]>([]);

    const waterGoal = user?.waterGoal || 3000;
    const stepGoal = 10000;
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
        } catch (err) { console.error('Error fetching water', err); }
    };

    const fetchDailyHealth = async () => {
        try {
            const res = await axios.get('/api/health/daily');
            setWater(res.data.water || 0);
            setSteps(res.data.steps || 0);
            setSleepHours(res.data.sleepHours || 0);
            setCaloriesBurned(res.data.caloriesBurned || 0);
            setCaloriesConsumed(res.data.caloriesConsumed || 0);
        } catch (err) { console.error('Error fetching daily health', err); }
    };

    const handleQuickLog = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            if (logType === 'WATER' && newWater) {
                if (newWater < 10 || newWater > 4000) return alert('Enter amount between 10ml - 4000ml');
                await axios.post('/api/habits/water', { amount: newWater });
                setNewWater(''); fetchWaterData();
            } else if (logType === 'STEPS' && newSteps) {
                await axios.post('/api/health/daily', { steps: steps + Number(newSteps) });
                setSteps(prev => prev + Number(newSteps)); setNewSteps('');
            } else if (logType === 'SLEEP' && newSleep) {
                await axios.post('/api/health/daily', { sleepHours: sleepHours + Number(newSleep) });
                setSleepHours(prev => prev + Number(newSleep)); setNewSleep('');
            } else if (logType === 'FOOD' && foodData.name && foodData.calories) {
                await axios.post('/api/health/daily', { foodItem: foodData });
                setCaloriesConsumed(prev => prev + foodData.calories); setFoodData({ name: '', calories: 0 });
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
        } catch (err) { alert('Failed to save log.'); } 
        finally { setLoading(false); }
    };

    const handleAddWater = async (amount: number) => {
        try { await axios.post('/api/habits/water', { amount }); fetchWaterData(); } 
        catch (err) { console.error('Failed to log water', err); }
    };

    const handleDeleteWater = async (id: string) => {
        try { await axios.delete(`/api/habits/water/${id}`); fetchWaterData(); } 
        catch (err) { alert('Failed to delete water log'); }
    };

    const fetchExercises = async () => {
        try { const res = await axios.get('/api/exercises'); setExercises(res.data); } 
        catch (err) { console.error('Error fetching exercises', err); }
    };

    const handleShareProgress = async () => {
        const content = prompt("What's on your mind? Share your progress!");
        if (!content) return;
        try { await axios.post('/api/social/post', { content }); alert('Progress shared successfully!'); } 
        catch (err) { alert('Failed to share progress'); }
    };

    const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, scale: 0.95, y: 15 }, show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 25 } } };

    const MetricCard = ({ title, value, target, unit, icon: Icon, gradientClass, progress }: any) => {
        const percentage = Math.min(100, Math.max(0, (progress || (value / target) * 100) || 0));
        return (
            <motion.div variants={itemVariants} className="bento-card group flex flex-col justify-between h-full min-h-[180px]">
                <div className="flex justify-between items-start mb-2">
                    <div className={`p-4 rounded-3xl ${gradientClass} text-white shadow-lg`}>
                        <Icon size={28} />
                    </div>
                </div>
                <div className="mt-4">
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">{title}</p>
                    <div className="flex items-baseline gap-2 mt-1">
                        <h3 className="text-4xl font-black tracking-tighter text-slate-800">{value}</h3>
                        <span className="text-lg font-bold text-slate-400">{unit}</span>
                    </div>
                </div>
                {target && (
                    <div className="mt-6">
                        <div className="flex justify-between text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                            <span>Progress</span>
                            <span className="text-slate-700">{Math.round(percentage)}%</span>
                        </div>
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner w-full">
                            <motion.div 
                                initial={{ width: 0 }} animate={{ width: `${percentage}%` }}
                                transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
                                className={`h-full ${gradientClass} rounded-full`} 
                            />
                        </div>
                    </div>
                )}
            </motion.div>
        );
    };

    return (
        <div className="pb-32 relative">
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8 auto-rows-auto">
                
                {/* Header Span */}
                <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 lg:col-span-4 bento-card flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gradient-to-r from-blue-50 to-indigo-50 border-none">
                    <div>
                        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-800 mb-2">Hey {user?.name?.split(' ')[0] || 'Athlete'} 👋</h1>
                        <p className="text-slate-500 font-medium text-lg">Your bento board is looking great today.</p>
                    </div>
                    <button onClick={handleShareProgress} className="mt-4 sm:mt-0 btn-bento">
                        Share Stats <ChevronRight size={20} />
                    </button>
                </motion.div>

                {/* Main Bento Cells */}
                <div className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 h-[450px]">
                    <WaterBowl current={water} goal={waterGoal} unit="ml" onAddWater={handleAddWater} />
                </div>

                <div className="col-span-1">
                    <MetricCard title="Steps Today" value={steps} target={stepGoal} unit="steps" icon={CheckCircle2} gradientClass="bg-gradient-to-br from-emerald-400 to-green-500" />
                </div>

                <div className="col-span-1">
                    <MetricCard title="Sleep" value={sleepHours} target={sleepGoal} unit="hrs" icon={Moon} gradientClass="bg-gradient-to-br from-indigo-400 to-violet-500" />
                </div>

                <div className="col-span-1 md:col-span-2 lg:col-span-2">
                    <motion.div variants={itemVariants} className="bento-card h-full flex flex-col justify-between bg-gradient-to-br from-orange-50 to-rose-50 border-none">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-4 bg-rose-500 rounded-3xl text-white shadow-lg shadow-rose-500/30"><Flame size={28} /></div>
                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-wide">Net Calories</h3>
                        </div>
                        <div className="flex justify-between items-end mt-4">
                            <div>
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Consumed</p>
                                <p className="text-3xl font-black text-rose-500">{caloriesConsumed}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Net</p>
                                <p className="text-5xl font-black text-slate-800">{caloriesConsumed - caloriesBurned}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Burned</p>
                                <p className="text-3xl font-black text-orange-500">{caloriesBurned}</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Chart Area */}
                <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 lg:col-span-3 bento-card min-h-[300px]">
                    <h3 className="text-xl font-black mb-6 flex items-center gap-3 text-slate-800 uppercase tracking-widest">
                        <Activity className="text-blue-500" size={24} /> Activity Trend
                    </h3>
                    <div className="h-[220px]">
                        <Line
                            data={{
                                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                                datasets: [{ label: 'Activity Points', data: [65, 59, 80, 81, 56, 55, 40], fill: true, borderColor: 'rgb(59, 130, 246)', backgroundColor: 'rgba(59, 130, 246, 0.1)', tension: 0.4 }]
                            }}
                            options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: 'rgba(0,0,0,0.05)' }, border: { dash: [4, 4] } }, x: { grid: { display: false } } } }}
                        />
                    </div>
                </motion.div>

                {/* Search Discovery */}
                <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 lg:col-span-1 bento-card flex flex-col justify-between">
                    <div>
                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest mb-4 flex gap-2 items-center"><Search className="text-indigo-500" /> Discover</h3>
                        <input
                            type="text" placeholder="Search friends..."
                            className="w-full bg-slate-100 border-none rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-bold transition-all placeholder:text-slate-400 placeholder:font-medium"
                            onChange={async (e) => {
                                if (e.target.value.length > 2) {
                                    try { setSearchResults((await axios.get(`/api/users/search?query=${e.target.value}`)).data); } catch (err) {}
                                } else setSearchResults([]);
                            }}
                        />
                    </div>
                    <div className="flex-1 mt-4 overflow-y-auto no-scrollbar">
                        {searchResults.map((result: any) => (
                            <div key={result.username} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl cursor-pointer">
                                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                                    {result.profilePicture ? <img src={result.profilePicture} className="w-full h-full object-cover"/> : <UserIcon size={16} className="text-slate-500"/>}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="font-bold text-slate-800 truncate text-sm">{result.name}</p>
                                    <p className="text-xs text-slate-400 truncate">@{result.username}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>

            {/* Quick Log Floating FAB */}
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }} className="fixed bottom-28 right-8 z-40">
                <button onClick={() => setActiveModal('QUICK_LOG')} className="w-16 h-16 rounded-[2rem] bg-blue-600 text-white shadow-[0_10px_25px_-5px_rgba(37,99,235,0.5)] flex items-center justify-center hover:scale-[1.05] active:scale-[0.95] transition-all">
                    <Plus size={32} />
                </button>
            </motion.div>

            {/* Universal Modal */}
            <AnimatePresence>
                {activeModal !== 'NONE' && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bento-card w-full max-w-lg shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] p-0 overflow-hidden relative border-none">
                            <div className="flex justify-between items-center p-6 bg-slate-50/80 border-b border-slate-100">
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight">{activeModal === 'QUICK_LOG' ? 'Quick Log' : 'Water History'}</h2>
                                <button onClick={() => setActiveModal('NONE')} className="p-2 bg-white shadow-sm hover:shadow-md rounded-full transition-all text-slate-500 hover:text-slate-800">
                                    <X size={20} />
                                </button>
                            </div>
                            
                            {activeModal === 'QUICK_LOG' && (
                                <div className="p-6 bg-white">
                                    <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-4 border-b border-slate-100">
                                        {[
                                            { id: 'WATER', icon: Droplets, label: 'Water' },
                                            { id: 'STEPS', icon: CheckCircle2, label: 'Steps' },
                                            { id: 'SLEEP', icon: Moon, label: 'Sleep' },
                                            { id: 'FOOD', icon: Apple, label: 'Food' },
                                            { id: 'WORKOUT', icon: Activity, label: 'Workout' }
                                        ].map(type => (
                                            <button key={type.id} onClick={() => setLogType(type.id as any)} className={`flex items-center gap-2 px-6 py-3 rounded-2xl whitespace-nowrap text-sm font-bold transition-all ${logType === type.id ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800'}`}>
                                                <type.icon size={18} /> {type.label}
                                            </button>
                                        ))}
                                    </div>
                                    <form onSubmit={handleQuickLog} className="space-y-6">
                                        <AnimatePresence mode="wait">
                                            <motion.div key={logType} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                                                {logType === 'WATER' && (
                                                    <div><label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Amount (ml)</label>
                                                    <input autoFocus type="number" placeholder="250" value={newWater} onChange={(e) => setNewWater(Number(e.target.value) || '')} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-blue-500 font-black text-2xl text-slate-800 transition-colors" /></div>
                                                )}
                                                {logType === 'STEPS' && (
                                                    <div><label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Steps Taken</label>
                                                    <input autoFocus type="number" placeholder="5000" value={newSteps} onChange={(e) => setNewSteps(Number(e.target.value) || '')} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-blue-500 font-black text-2xl text-slate-800 transition-colors" /></div>
                                                )}
                                                {logType === 'SLEEP' && (
                                                    <div><label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Hours Slept</label>
                                                    <input autoFocus type="number" step="0.5" placeholder="7.5" value={newSleep} onChange={(e) => setNewSleep(Number(e.target.value) || '')} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-blue-500 font-black text-2xl text-slate-800 transition-colors" /></div>
                                                )}
                                                {logType === 'FOOD' && (
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="col-span-2 sm:col-span-1"><label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Name</label>
                                                        <input autoFocus type="text" placeholder="Banana" value={foodData.name} onChange={(e) => setFoodData({...foodData, name: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-4 outline-none focus:border-blue-500 font-bold text-slate-800 transition-colors" /></div>
                                                        <div className="col-span-2 sm:col-span-1"><label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Calories</label>
                                                        <input type="number" placeholder="105" value={foodData.calories || ''} onChange={(e) => setFoodData({...foodData, calories: Number(e.target.value) || 0})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-4 outline-none focus:border-blue-500 font-bold text-slate-800 transition-colors" /></div>
                                                    </div>
                                                )}
                                                {logType === 'WORKOUT' && (
                                                    <div className="space-y-4">
                                                        <div><label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Select Exercise</label>
                                                        <select required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-4 outline-none focus:border-blue-500 font-bold text-slate-800 transition-colors" value={workoutData.exerciseId} onChange={(e) => setWorkoutData({ ...workoutData, exerciseId: e.target.value })}><option value="" disabled>Choose an exercise...</option>{exercises.map(ex => (<option key={ex._id} value={ex._id}>{ex.name} ({ex.category})</option>))}</select></div>
                                                        <div className="grid grid-cols-3 gap-3">
                                                            <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Sets</label><input type="number" placeholder="3" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none focus:border-blue-500 font-black text-lg text-slate-800" value={workoutData.sets} onChange={(e) => setWorkoutData({ ...workoutData, sets: parseInt(e.target.value) || 0 })} /></div>
                                                            <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Reps</label><input type="number" placeholder="10" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none focus:border-blue-500 font-black text-lg text-slate-800" value={workoutData.reps} onChange={(e) => setWorkoutData({ ...workoutData, reps: parseInt(e.target.value) || 0 })} /></div>
                                                            <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Wt(kg)</label><input type="number" placeholder="60" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none focus:border-blue-500 font-black text-lg text-slate-800" value={workoutData.weight} onChange={(e) => setWorkoutData({ ...workoutData, weight: parseInt(e.target.value) || 0 })} /></div>
                                                        </div>
                                                    </div>
                                                )}
                                            </motion.div>
                                        </AnimatePresence>
                                        <button type="submit" disabled={loading} className="w-full btn-bento py-5 text-xl">
                                            {loading ? 'Logging...' : `Log ${logType.charAt(0) + logType.slice(1).toLowerCase()}`}
                                        </button>
                                    </form>
                                </div>
                            )}
                            
                            {activeModal === 'WATER_LOGS' && (
                                <div className="p-6 max-h-[60vh] overflow-y-auto no-scrollbar space-y-3 bg-white">
                                    {waterLogs.length === 0 ? (
                                        <p className="text-center font-bold text-slate-400 py-8">No water logged today.</p>
                                    ) : (
                                        waterLogs.map((log) => (
                                            <div key={log._id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 p-4 rounded-2xl gap-4">
                                                <div className="flex items-center gap-4 text-lg">
                                                    <div className="p-3 bg-blue-100 rounded-xl text-blue-500"><Droplets size={24} /></div>
                                                    <span className="font-black text-2xl text-slate-800">{log.amount} ml</span>
                                                    <span className="text-sm font-bold text-slate-400 uppercase ml-2">{new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <button onClick={() => handleDeleteWater(log._id)} className="bg-rose-100 hover:bg-rose-200 text-rose-600 px-6 py-3 rounded-xl text-sm font-bold transition-colors">
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
