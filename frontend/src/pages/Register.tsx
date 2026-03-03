import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const Register = () => {
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        gender: 'FEMALE'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await register(formData);
        } catch (err) {
            alert('Registration failed');
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[80vh]">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass p-12 max-w-md w-full"
            >
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold mb-2 gradient-text">Join FitTrack</h2>
                    <p className="text-text-muted">Start tracking your habits and competing with friends</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-muted flex items-center gap-2">
                            <UserIcon size={16} /> Username
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s/g, '') })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                            placeholder="johndoe123"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-muted flex items-center gap-2">
                            <Mail size={16} /> Email Address
                        </label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-muted flex items-center gap-2">
                            <Lock size={16} /> Password
                        </label>
                        <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-muted">Gender (For personalized insights)</label>
                        <select
                            value={formData.gender}
                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all appearance-none"
                        >
                            <option value="MALE" className="bg-background">Male</option>
                            <option value="FEMALE" className="bg-background">Female</option>
                            <option value="OTHER" className="bg-background">Other</option>
                        </select>
                    </div>

                    <button type="submit" className="btn-primary w-full py-4 text-lg mt-4 flex items-center justify-center gap-2">
                        <UserPlus size={20} /> Create Account
                    </button>
                </form>

                <p className="text-center mt-8 text-text-muted">
                    Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Login</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Register;
