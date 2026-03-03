import React, { useState } from 'react';
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
    const [water, setWater] = useState(1200);
    const [searchResults, setSearchResults] = useState([]);
    const goal = 3000;

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
                        <button className="btn-primary flex items-center gap-2">
                            <Plus size={20} /> Log Workout
                        </button>
                        <button className="bg-surface-border hover:bg-white/10 transition-colors px-6 py-3 rounded-xl font-semibold">
                            Share Progress
                        </button>
                    </div>
                </div>
                <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-primary/20 blur-[100px] rounded-full"></div>
            </div>

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
                    <button onClick={() => setWater(w => w + 250)} className="bg-white/5 hover:bg-white/10 p-4 rounded-2xl transition-all border border-white/5 text-center">
                        <span className="block text-xl font-bold">+250</span>
                        <span className="text-xs text-text-muted">Glass</span>
                    </button>
                    <button onClick={() => setWater(w => w + 500)} className="bg-white/5 hover:bg-white/10 p-4 rounded-2xl transition-all border border-white/5 text-center">
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
