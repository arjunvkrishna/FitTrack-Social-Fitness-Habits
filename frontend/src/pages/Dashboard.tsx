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
        duration: 30
    });

    const goal = user?.waterGoal || 3000;

    useEffect(() => {
        fetchExercises();
        fetchWaterIntake();
    }, []);

    const fetchWaterIntake = async () => {
        try {
            const res = await axios.get('/api/habits/water');
            const today = new Date().setHours(0, 0, 0, 0);
            const todaysIntake = res.data
                .filter((w: any) => new Date(w.date).setHours(0, 0, 0, 0) === today)
                .reduce((sum: number, w: any) => sum + w.amount, 0);
            setWater(todaysIntake);
        } catch (err) {
            console.error('Error fetching water intake', err);
        }
    };

    const handleAddWater = async (amount: number) => {
        try {
            await axios.post('/api/habits/water', { amount });
            setWater(w => w + amount);
        } catch (err) {
            console.error('Error adding water', err);
            alert('Failed to log water intake.');
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
            setShowLogModal(false);
            alert('Workout logged successfully!');
        } catch (err) {
            console.error('Error logging workout', err);
            alert('Failed to log workout');
        } finally {
            setLoading(false);
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

            {/* Stats Summary */}
            <div className="glass p-6 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Social Rank</h3>
                    <Trophy className="text-yellow-400" size={24} />
                </div>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-text-muted">Personal Points</span>
                        <span className="font-bold">{user?.points || 1240}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-text-muted">Friend Rank</span>
                        <span className="font-bold text-accent">#3 / 12</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-text-muted">Monthly Status</span>
                        <span className="font-bold text-secondary">Elite</span>
                    </div>
                </div>
            </div>

            {/* Water Tracking Card */}
            <div className="glass p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-bold mb-1">Hydration</h3>
                        <p className="text-text-muted text-sm">{water}ml of {goal}ml</p>
                    </div>
                    <div className="p-3 bg-blue-500/20 rounded-2xl">
                        <Droplets className="text-blue-400" size={28} />
                    </div>
                </div>

                <div className="relative h-4 bg-white/5 rounded-full mb-8 overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(water / goal) * 100}%` }}
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-primary"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => handleAddWater(250)} className="bg-white/5 hover:bg-white/10 p-4 rounded-2xl transition-all border border-white/5 text-center">
                        <span className="block text-xl font-bold">+250</span>
                        <span className="text-xs text-text-muted">Glass</span>
                    </button>
                    <button onClick={() => handleAddWater(500)} className="bg-white/5 hover:bg-white/10 p-4 rounded-2xl transition-all border border-white/5 text-center">
                        <span className="block text-xl font-bold">+500</span>
                        <span className="text-xs text-text-muted">Bottle</span>
                    </button>
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
