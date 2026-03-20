import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, UserCheck, UserX, Shield, Search,
    MoreVertical, Trash2, Key, RefreshCcw,
    Plus, Activity, Database, AlertCircle
} from 'lucide-react';
import axios from 'axios';

interface User {
    _id: string;
    name: string;
    username: string;
    email: string;
    role: string;
    isActive: boolean;
    points: number;
    streaks: {
        overall: number;
    };
    created_at: string;
}

interface Exercise {
    _id: string;
    name: string;
    category: string;
    targetMuscleGroup: string;
}

const AdminDashboard: React.FC = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'users' | 'exercises'>('users');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
    const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
    const [exerciseFormData, setExerciseFormData] = useState({
        name: '',
        category: 'STRENGTH',
        targetMuscleGroup: ''
    });

    useEffect(() => {
        fetchUsers();
        fetchExercises();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get('/api/users/admin/all', {
                headers: { 'X-User-ID': user?.id }
            });
            setUsers(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching users:', err);
            setLoading(false);
        }
    };

    const fetchExercises = async () => {
        try {
            const res = await axios.get('/api/exercises');
            setExercises(res.data);
        } catch (err) {
            console.error('Error fetching exercises:', err);
        }
    };

    const handleSaveExercise = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingExercise) {
                await axios.put(`/api/exercises/${editingExercise._id}`, exerciseFormData, {
                    headers: { 'X-User-ID': user?.id }
                });
            } else {
                await axios.post('/api/exercises', exerciseFormData, {
                    headers: { 'X-User-ID': user?.id }
                });
            }
            setIsExerciseModalOpen(false);
            setEditingExercise(null);
            setExerciseFormData({ name: '', category: 'STRENGTH', targetMuscleGroup: '' });
            fetchExercises();
        } catch (err) {
            alert('Error saving exercise');
        }
    };

    const handleDeleteExercise = async (id: string) => {
        if (!confirm('Are you sure you want to delete this exercise?')) return;
        try {
            await axios.delete(`/api/exercises/${id}`, {
                headers: { 'X-User-ID': user?.id }
            });
            fetchExercises();
        } catch (err) {
            alert('Error deleting exercise');
        }
    };

    const openExerciseModal = (exercise?: Exercise) => {
        if (exercise) {
            setEditingExercise(exercise);
            setExerciseFormData({
                name: exercise.name,
                category: exercise.category,
                targetMuscleGroup: exercise.targetMuscleGroup
            });
        } else {
            setEditingExercise(null);
            setExerciseFormData({ name: '', category: 'STRENGTH', targetMuscleGroup: '' });
        }
        setIsExerciseModalOpen(true);
    };

    const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
        setActionLoading(userId);
        try {
            await axios.put('/api/users/admin/status', {
                userId,
                isActive: !currentStatus
            }, { headers: { 'X-User-ID': user?.id } });
            await fetchUsers();
        } catch (err) {
            alert('Error updating status');
        }
        setActionLoading(null);
    };

    const handleResetPassword = async (userId: string) => {
        const newPassword = prompt('Enter temporary password:');
        if (!newPassword) return;

        setActionLoading(userId);
        try {
            await axios.put('/api/users/admin/reset-password', {
                userId,
                newPassword
            }, { headers: { 'X-User-ID': user?.id } });
            alert('Password reset successfully');
        } catch (err) {
            alert('Error resetting password');
        }
        setActionLoading(null);
    };

    const handleResetStats = async (userId: string) => {
        if (!confirm('Are you sure you want to reset all stats for this user?')) return;

        setActionLoading(userId);
        try {
            await axios.post('/api/habits/admin/reset-stats', {
                userId
            }, { headers: { 'X-User-ID': user?.id } });
            await fetchUsers();
            alert('Stats reset successfully');
        } catch (err) {
            alert('Error resetting stats');
        }
        setActionLoading(null);
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('PERMANENT DELETE: Are you sure?')) return;

        setActionLoading(userId);
        try {
            await axios.delete(`/api/users/admin/${userId}`, {
                headers: { 'X-User-ID': user?.id }
            });
            await fetchUsers();
        } catch (err) {
            alert('Error deleting user');
        }
        setActionLoading(null);
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredExercises = exercises.filter(ex =>
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.targetMuscleGroup.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = {
        total: users.length,
        active: users.filter(u => u.isActive).length,
        admins: users.filter(u => u.role === 'ADMIN').length,
    };

    return (
        <div className="min-h-screen bg-bg-main p-8">
            <header className="mb-12">
                <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 rounded-2xl bg-primary/20 text-primary">
                        <Shield size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold">Admin Console</h1>
                        <p className="text-text-muted">Manage system users and global configurations</p>
                    </div>
                </div>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {[
                    { label: 'Total Users', value: stats.total, icon: Users, color: 'text-primary' },
                    { label: 'Active Accounts', value: stats.active, icon: UserCheck, color: 'text-accent' },
                    { label: 'Administrators', value: stats.admins, icon: Shield, color: 'text-secondary' },
                ].map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={stat.label}
                        className="glass p-6 flex items-center justify-between"
                    >
                        <div>
                            <p className="text-text-muted text-sm mb-1">{stat.label}</p>
                            <p className="text-3xl font-bold">{stat.value}</p>
                        </div>
                        <div className={`p-4 rounded-xl bg-white/5 ${stat.color}`}>
                            <stat.icon size={28} />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Content */}
            <div className="glass overflow-hidden">
                <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`px-6 py-2 rounded-xl font-semibold transition-all ${activeTab === 'users' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-white/5'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Users size={18} /> User Management
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('exercises')}
                            className={`px-6 py-2 rounded-xl font-semibold transition-all ${activeTab === 'exercises' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-white/5'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Activity size={18} /> Exercise Catalog
                            </div>
                        </button>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                        <input
                            type="text"
                            placeholder="Search name, username, email..."
                            className="bg-white/5 border border-white/10 rounded-xl pl-12 pr-6 py-2 w-full md:w-80 outline-none focus:ring-2 focus:ring-primary transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {activeTab === 'users' ? (
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-text-muted text-sm">
                                    <th className="px-8 py-4 font-medium uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 font-medium uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 font-medium uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 font-medium uppercase tracking-wider">Stats</th>
                                    <th className="px-6 py-4 font-medium uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr><td colSpan={5} className="p-12 text-center text-text-muted">Loading user data...</td></tr>
                                ) : filteredUsers.map((u) => (
                                    <tr key={u._id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary">
                                                    {u.name[0]}
                                                </div>
                                                <div>
                                                    <p className="font-semibold">{u.name}</p>
                                                    <p className="text-xs text-text-muted">@{u.username}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest ${u.role === 'ADMIN' ? 'bg-secondary/20 text-secondary' : 'bg-primary/20 text-primary'
                                                }`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${u.isActive ? 'bg-accent shadow-[0_0_8px_rgba(56,239,125,0.5)]' : 'bg-red-500'}`}></div>
                                                <span className="text-sm">{u.isActive ? 'Active' : 'Disabled'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-4 text-xs">
                                                <div>
                                                    <p className="text-text-muted mb-0.5">Points</p>
                                                    <p className="font-mono">{u.points}</p>
                                                </div>
                                                <div>
                                                    <p className="text-text-muted mb-0.5">Streak</p>
                                                    <p className="font-mono">{u.streaks.overall}d</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    title={u.isActive ? "Disable User" : "Enable User"}
                                                    onClick={() => handleToggleStatus(u._id, u.isActive)}
                                                    className={`p-2 rounded-lg transition-colors ${u.isActive ? 'hover:bg-red-500/20 text-red-500' : 'hover:bg-accent/20 text-accent'}`}
                                                >
                                                    {u.isActive ? <UserX size={18} /> : <UserCheck size={18} />}
                                                </button>
                                                <button
                                                    title="Reset Password"
                                                    onClick={() => handleResetPassword(u._id)}
                                                    className="p-2 rounded-lg hover:bg-white/10 text-text-muted transition-colors"
                                                >
                                                    <Key size={18} />
                                                </button>
                                                <button
                                                    title="Reset Stats"
                                                    onClick={() => handleResetStats(u._id)}
                                                    className="p-2 rounded-lg hover:bg-white/10 text-text-muted transition-colors"
                                                >
                                                    <RefreshCcw size={18} />
                                                </button>
                                                <button
                                                    title="Delete User"
                                                    onClick={() => handleDeleteUser(u._id)}
                                                    className="p-2 rounded-lg hover:bg-red-500/20 text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold">Exercise Library</h3>
                                <button
                                    onClick={() => openExerciseModal()}
                                    className="px-4 py-2 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2 hover:scale-105 transition-transform"
                                >
                                    <Plus size={18} /> Add Exercise
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredExercises.map((ex) => (
                                    <motion.div
                                        key={ex._id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="glass p-6 group relative"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 rounded-xl bg-primary/10 text-primary">
                                                <Activity size={24} />
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openExerciseModal(ex)}
                                                    className="p-2 rounded-lg hover:bg-white/10 text-text-muted transition-colors"
                                                >
                                                    <Key size={16} /> {/* Using Key icon for edit placeholder */}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteExercise(ex._id)}
                                                    className="p-2 rounded-lg hover:bg-red-500/20 text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        <h4 className="text-xl font-bold mb-1">{ex.name}</h4>
                                        <div className="flex gap-2 mb-4">
                                            <span className="text-[10px] uppercase tracking-wider font-bold bg-white/5 px-2 py-1 rounded-md text-text-muted">
                                                {ex.category}
                                            </span>
                                            <span className="text-[10px] uppercase tracking-wider font-bold bg-primary/10 px-2 py-1 rounded-md text-primary">
                                                {ex.targetMuscleGroup}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {filteredExercises.length === 0 && (
                                <div className="text-center py-20 text-text-muted">
                                    <Database size={48} className="mx-auto mb-4 opacity-10" />
                                    <p>No exercises found matching your search.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Exercise Modal */}
            <AnimatePresence>
                {isExerciseModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="glass max-w-lg w-full p-8 overflow-hidden relative"
                        >
                            <h2 className="text-2xl font-bold mb-6">
                                {editingExercise ? 'Edit Exercise' : 'Add New Exercise'}
                            </h2>
                            <form onSubmit={handleSaveExercise} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-muted mb-1">Exercise Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
                                        value={exerciseFormData.name}
                                        onChange={e => setExerciseFormData({ ...exerciseFormData, name: e.target.value })}
                                        placeholder="e.g. Bench Press"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text-muted mb-1">Category</label>
                                        <select
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
                                            value={exerciseFormData.category}
                                            onChange={e => setExerciseFormData({ ...exerciseFormData, category: e.target.value })}
                                        >
                                            <option value="STRENGTH">Strength</option>
                                            <option value="CARDIO">Cardio</option>
                                            <option value="FLEXIBILITY">Flexibility</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-muted mb-1">Muscle Group</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
                                            value={exerciseFormData.targetMuscleGroup}
                                            onChange={e => setExerciseFormData({ ...exerciseFormData, targetMuscleGroup: e.target.value })}
                                            placeholder="e.g. Chest"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-4 mt-8">
                                    <button
                                        type="button"
                                        onClick={() => setIsExerciseModalOpen(false)}
                                        className="flex-1 px-6 py-3 rounded-xl font-bold bg-white/5 hover:bg-white/10 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 rounded-xl font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    >
                                        {editingExercise ? 'Save Changes' : 'Create Exercise'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminDashboard;
