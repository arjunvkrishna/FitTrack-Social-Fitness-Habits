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
        <div className="flex justify-center items-center min-h-[80vh]">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass p-12 max-w-2xl w-full"
            >
                <div className="text-center mb-10">
                    <div className="flex justify-center items-center mb-4">
                        <div className="p-4 bg-primary/10 rounded-2xl border border-white/10">
                            <Shield className="text-primary" size={32} />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold mb-2 gradient-text">Welcome to FitTrack</h2>
                    <p className="text-text-muted mb-4">Initial System Configuration</p>
                    <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                        <p className="text-sm leading-relaxed text-text-muted">
                            You are identified as the first user. Please setup the master administrator account.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-muted flex items-center gap-2">
                            <User size={16} /> Full Name
                        </label>
                        <input
                            type="text"
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                            placeholder="e.g. John Doe"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-muted flex items-center gap-2">
                                <Shield size={16} /> Username
                            </label>
                            <input
                                type="text"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                                placeholder="admin"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().trim() })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-muted flex items-center gap-2">
                                <Mail size={16} /> Admin Email
                            </label>
                            <input
                                type="email"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                                placeholder="admin@fittrack.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-muted flex items-center gap-2">
                            <Lock size={16} /> Master Password
                        </label>
                        <input
                            type="password"
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                            placeholder="••••••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-muted flex items-center gap-2">
                            <Lock size={16} /> Confirm Password
                        </label>
                        <input
                            type="password"
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                            placeholder="••••••••••••"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        />
                    </div>

                    {message && (
                        <div className={`p-4 rounded-xl flex items-center justify-center gap-2 ${status === 'error' ? 'text-secondary' : 'text-accent'}`}>
                            {status === 'success' && <CheckCircle2 size={16} />}
                            <p className="text-sm font-medium">{message}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={status === 'loading' || status === 'success'}
                        className="btn-primary w-full py-4 text-lg mt-4 flex items-center justify-center gap-2"
                    >
                        {status === 'loading' ? (
                            'Configuring System...'
                        ) : (
                            <>
                                Initialize System <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default Setup;
