import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, User, Mail, Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Setup = () => {
    const [formData, setFormData] = useState({
        name: '',
        username: 'admin',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setMessage('Passwords do not match');
            setStatus('error');
            return;
        }

        setStatus('loading');
        try {
            await axios.post('/api/auth/setup', {
                name: formData.name,
                username: formData.username,
                email: formData.email,
                password: formData.password
            });
            setStatus('success');
            setMessage('Admin account created successfully! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err: any) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'Error during setup');
        }
    };

    return (
        <div className="min-h-[90vh] flex items-center justify-center py-12 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-10 w-full max-w-2xl relative overflow-hidden"
            >
                {/* Decorative background icon - repositioned to avoid overlap */}
                <div className="absolute -top-10 -right-10 text-primary/5 pointer-events-none">
                    <Shield size={240} />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 backdrop-blur-xl">
                            <Shield className="text-primary" size={32} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Welcome to FitTrack</h2>
                            <p className="text-text-muted">Initial System Configuration</p>
                        </div>
                    </div>

                    <div className="bg-primary/5 border border-primary/10 p-5 rounded-2xl mb-8">
                        <p className="text-sm leading-relaxed text-text-muted italic">
                            You are identified as the first user. Please setup the master administrator account to initialize the system and manage global settings.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={20} />
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-white/20"
                                    placeholder="e.g. John Doe"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">Username</label>
                                <div className="relative group">
                                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-white/20"
                                        placeholder="admin"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().trim() })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">Admin Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-white/20"
                                        placeholder="admin@fittrack.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">Master Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={20} />
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                                    placeholder="••••••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">Confirm Master Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={20} />
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                                    placeholder="••••••••••••"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                />
                            </div>
                        </div>

                        {message && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`p-4 rounded-xl flex items-center gap-3 ${status === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}
                            >
                                {status === 'success' ? <CheckCircle2 size={20} /> : null}
                                <p className="text-sm font-medium">{message}</p>
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={status === 'loading' || status === 'success'}
                            className="w-full btn-primary py-5 rounded-2xl font-bold flex items-center justify-center gap-3 group disabled:opacity-50 shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-shadow"
                        >
                            {status === 'loading' ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Configuring System...
                                </div>
                            ) : (
                                <>
                                    Initialize System <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default Setup;
