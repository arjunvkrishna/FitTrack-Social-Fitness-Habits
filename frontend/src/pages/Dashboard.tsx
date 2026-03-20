import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Droplets, Flame, Calendar, Trophy, Plus, CheckCircle2, Search, User as UserIcon } from 'lucide-react';
import axios from 'axios';
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
    const [water, setWater] = useState(0);
    const [steps, setSteps] = useState(0);
    const [sleepHours, setSleepHours] = useState(0);
    const [caloriesBurned, setCaloriesBurned] = useState(0);
    const [caloriesConsumed, setCaloriesConsumed] = useState(0);

    const [searchResults, setSearchResults] = useState([]);
    const [exercises, setExercises] = useState<any[]>([]);
    const [showLogModal, setShowLogModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const [workoutData, setWorkoutData] = useState({
        exerciseId: '',
        type: 'GYM' as 'GYM' | 'RUNNING' | 'CUSTOM',
        sets: 0,
        reps: 0,
        weight: 0,
        duration: 30,
        caloriesBurned: 0
    });

    const [foodData, setFoodData] = useState({ name: '', calories: 0 });
    const [newSleep, setNewSleep] = useState<number | ''>('');
    const [newSteps, setNewSteps] = useState<number | ''>('');

    // Hydration specific state
    const [newWater, setNewWater] = useState<number | ''>('');
    const [waterLogs, setWaterLogs] = useState<any[]>([]);
    const [waterHistoryAgg, setWaterHistoryAgg] = useState<any[]>([]);

    const goal = user?.waterGoal || 3000;

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

    const handleAddWater = async () => {
        if (!newWater || newWater < 10 || newWater > 4000) {
            alert('Please enter a valid amount between 10ml and 4000ml');
            return;
        }
        try {
            await axios.post('/api/habits/water', { amount: newWater });
            setNewWater('');
            fetchWaterData();
        } catch (err) {
            console.error('Error adding water', err);
            alert('Failed to log water intake.');
        }
    };

    const handleEditWater = async (id: string, newAmount: number) => {
        if (newAmount < 10 || newAmount > 4000) return alert('Please enter a valid amount between 10ml and 4000ml');
        try {
            await axios.put(`/api/habits/water/${id}`, { amount: newAmount });
            fetchWaterData();
        } catch (err) {
            alert('Failed to edit water');
        }
    };

    const handleDeleteWater = async (id: string) => {
        if (!confirm('Are you sure you want to delete this water log?')) return;
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

    const handleLogWorkout = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const selectedExercise = exercises.find(ex => ex._id === workoutData.exerciseId);
            const data = {
                ...workoutData,
                activityName: selectedExercise?.name || 'Workout'
            };
            await axios.post('/api/habits/workout', data);

            // Optimistically update calories burned
            setCaloriesBurned(prev => prev + (workoutData.caloriesBurned || 0));

            setShowLogModal(false);
            alert('Workout logged successfully!');
        } catch (err) {
            console.error('Error logging workout', err);
            alert('Failed to log workout');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateHealth = async (payload: any) => {
        try {
            await axios.post('/api/health/daily', payload);
            if (payload.steps !== undefined) setSteps(payload.steps);
            if (payload.sleepHours !== undefined) setSleepHours(payload.sleepHours);
            if (payload.foodItem) setCaloriesConsumed(prev => prev + payload.foodItem.calories);
        } catch (err) {
            console.error('Error updating health', err);
            alert('Failed to update log');
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

    const chartData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
            label: 'Activity Points',
            data: [65, 59, 80, 81, 56, 55, 40],
            fill: true,
            borderColor: 'rgb(139, 92, 246)',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            tension: 0.4
        }]
    };

    const waterChartData = {
        labels: waterHistoryAgg.map(d => new Date(d._id).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
        datasets: [{
            label: 'Hydration (ml)',
            data: waterHistoryAgg.map(d => d.total),
            fill: true,
            borderColor: '#60a5fa',
            backgroundColor: 'rgba(96, 165, 250, 0.1)',
            tension: 0.4
        }]
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
            {/* Welcome Card */}
            <div className="md:col-span-2 glass p-8 relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-4xl font-bold mb-2">Hello, {user?.name || 'Athlete'}! ✨</h1>
                    <p className="text-text-muted mb-6">You're on a <span className="text-accent font-bold">5 day streak</span>. Keep it up!</p>

                    <div className="flex gap-4">
                        <button
                            onClick={() => setShowLogModal(true)}
                            className="btn-primary flex items-center gap-2"
                        >
                            <Plus size={20} /> Log Workout
                        </button>
                        <button
                            onClick={handleShareProgress}
                            className="bg-surface-border hover:bg-white/10 transition-colors px-6 py-3 rounded-xl font-semibold"
                        >
                            Share Progress
                        </button>
                    </div>
                </div>
                <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-primary/20 blur-[100px] rounded-full"></div>
            </div>

            {/* Workout Log Modal */}
            {showLogModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass w-full max-w-lg p-8 relative"
                    >
                        <h2 className="text-2xl font-bold mb-6">Log Workout</h2>
                        <form onSubmit={handleLogWorkout} className="space-y-4">
                            <div>
                                <label className="block text-sm text-text-muted mb-2">Select Exercise</label>
                                <select
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                                    value={workoutData.exerciseId}
                                    onChange={(e) => setWorkoutData({ ...workoutData, exerciseId: e.target.value })}
                                >
                                    <option value="" disabled>Choose an exercise...</option>
                                    {exercises.map(ex => (
                                        <option key={ex._id} value={ex._id}>{ex.name} ({ex.category})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm text-text-muted mb-2">Sets</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                                        value={workoutData.sets}
                                        onChange={(e) => setWorkoutData({ ...workoutData, sets: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-text-muted mb-2">Reps</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                                        value={workoutData.reps}
                                        onChange={(e) => setWorkoutData({ ...workoutData, reps: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-text-muted mb-2">Weight (kg)</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                                        value={workoutData.weight}
                                        onChange={(e) => setWorkoutData({ ...workoutData, weight: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setShowLogModal(false)}
                                    className="flex-1 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 btn-primary"
                                >
                                    {loading ? 'Saving...' : 'Save Workout'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Daily Health Tracking Grid */}
            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Hydration */}
                <div className="glass p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-bold text-lg">Hydration</h3>
                            <p className="text-sm text-text-muted">{water} / {goal} ml</p>
                        </div>
                        <Droplets className="text-blue-400" size={24} />
                    </div>
                    <div className="h-2 bg-white/5 rounded-full mb-4 overflow-hidden">
                        <motion.div className="h-full bg-gradient-to-r from-blue-500 to-primary" style={{ width: `${Math.min(100, (water / goal) * 100)}%` }} />
                    </div>
                    <div className="flex gap-2 mb-4">
                        <input type="number" min="10" max="4000" placeholder="Add ml" value={newWater} onChange={e => setNewWater(Number(e.target.value) || '')} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" />
                        <button onClick={handleAddWater} className="bg-primary/20 hover:bg-primary/30 text-primary py-2 px-4 rounded-lg text-sm font-bold transition-colors">Add</button>
                    </div>

                    {/* Today's Logs */}
                    {waterLogs.length > 0 && (
                        <div className="mt-4 space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                            <h4 className="text-xs text-text-muted font-bold uppercase mb-2">Today's Logs</h4>
                            {waterLogs.map((log) => (
                                <div key={log._id} className="flex items-center justify-between bg-white/5 p-2 rounded-lg text-sm">
                                    <span>{log.amount} ml <span className="text-xs text-text-muted ml-2">{new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></span>
                                    <div className="flex gap-2">
                                        <button onClick={() => {
                                            const amt = prompt('Edit amount (ml):', log.amount.toString());
                                            if (amt) handleEditWater(log._id, Number(amt));
                                        }} className="text-blue-400 hover:text-blue-300 text-xs">Edit</button>
                                        <button onClick={() => handleDeleteWater(log._id)} className="text-red-400 hover:text-red-300 text-xs">✕</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Steps */}
                <div className="glass p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-bold text-lg">Steps</h3>
                            <p className="text-sm text-text-muted text-accent">{steps} steps total</p>
                        </div>
                        <CheckCircle2 className="text-green-400" size={24} />
                    </div>
                    <div className="flex gap-2 mt-8">
                        <input type="number" placeholder="Add steps" value={newSteps} onChange={e => setNewSteps(Number(e.target.value) || '')} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" />
                        <button onClick={() => { if (newSteps) { handleUpdateHealth({ steps: steps + Number(newSteps) }); setNewSteps(''); } }} className="btn-primary px-4 font-bold">+</button>
                    </div>
                </div>

                {/* Sleep */}
                <div className="glass p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-bold text-lg">Sleep</h3>
                            <p className="text-sm text-text-muted text-purple-300">{sleepHours} hrs total</p>
                        </div>
                        <Trophy className="text-purple-400" size={24} />
                    </div>
                    <div className="flex gap-2 mt-8">
                        <input type="number" step="0.5" placeholder="Add hrs" value={newSleep} onChange={e => setNewSleep(Number(e.target.value) || '')} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" />
                        <button onClick={() => { if (newSleep) { handleUpdateHealth({ sleepHours: sleepHours + Number(newSleep) }); setNewSleep(''); } }} className="btn-primary px-4 font-bold">+</button>
                    </div>
                </div>

                {/* Calories */}
                <div className="glass p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-lg">Net Calories</h3>
                        <Flame className="text-orange-400" size={24} />
                    </div>
                    <div className="text-2xl font-black mb-1 text-red-300">{caloriesConsumed - caloriesBurned} <span className="text-sm font-normal text-text-muted">kcal</span></div>
                    <div className="flex justify-between text-xs text-text-muted mb-4">
                        <span>In: {caloriesConsumed}</span>
                        <span>Burned: {caloriesBurned}</span>
                    </div>
                    <div className="flex gap-2 flex-col">
                        <div className="flex gap-2">
                            <input type="text" placeholder="Food" value={foodData.name} onChange={e => setFoodData({ ...foodData, name: e.target.value })} className="w-3/5 bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" />
                            <input type="number" placeholder="kcal" value={foodData.calories || ''} onChange={e => setFoodData({ ...foodData, calories: parseInt(e.target.value) || 0 })} className="w-2/5 bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" />
                        </div>
                        <button onClick={() => { if (foodData.name && foodData.calories) { handleUpdateHealth({ foodItem: foodData }); setFoodData({ name: '', calories: 0 }); } }} className="btn-primary py-1.5 text-sm font-bold mt-1">Add Food</button>
                    </div>
                </div>
            </div>

            {/* Hydration History Chart */}
            <div className="md:col-span-1 glass p-8">
                <h3 className="text-xl font-bold mb-6">Hydration Track</h3>
                <div className="h-[250px]">
                    <Line
                        data={waterChartData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: {
                                y: { grid: { display: false }, ticks: { color: '#94a3b8' } },
                                x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
                            }
                        }}
                    />
                </div>
            </div>

            {/* Activity Chart */}
            <div className="md:col-span-2 glass p-8">
                <h3 className="text-xl font-bold mb-6">Activity Peak</h3>
                <div className="h-[250px]">
                    <Line
                        data={chartData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: {
                                y: { grid: { display: false }, ticks: { color: '#94a3b8' } },
                                x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
                            }
                        }}
                    />
                </div>
            </div>

            {/* User Search Section */}
            <div className="md:col-span-3 glass p-8">
                <div className="flex items-center gap-4 mb-6">
                    <Trophy className="text-primary" size={24} />
                    <h3 className="text-xl font-bold">Search FitTrackers</h3>
                </div>
                <div className="relative mb-6">
                    <input
                        type="text"
                        placeholder="Search by username or name..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary text-lg"
                        onChange={async (e) => {
                            const val = e.target.value;
                            if (val.length > 2) {
                                try {
                                    const res = await axios.get(`/api/users/search?query=${val}`);
                                    setSearchResults(res.data);
                                } catch (err) { console.error(err); }
                            } else {
                                setSearchResults([]);
                            }
                        }}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {searchResults.map((result: any) => (
                        <div key={result.username} className="glass p-4 flex items-center gap-4 hover:border-primary transition-colors cursor-pointer group">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
                                {result.profilePicture ? (
                                    <img src={result.profilePicture} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon size={20} className="text-text-muted" />
                                )}
                            </div>
                            <div>
                                <p className="font-bold group-hover:text-primary transition-colors">{result.name}</p>
                                <p className="text-xs text-text-muted">@{result.username}</p>
                            </div>
                        </div>
                    ))}
                    {searchResults.length === 0 && (
                        <p className="text-text-muted text-sm col-span-full text-center py-4">
                            Try searching for your friends' usernames!
                        </p>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default Dashboard;
