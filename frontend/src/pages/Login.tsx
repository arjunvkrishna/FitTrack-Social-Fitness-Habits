import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Login = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(email, password);
        } catch (err) {
            alert('Login failed');
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
                    <h2 className="text-3xl font-bold mb-2 gradient-text">Welcome Back</h2>
                    <p className="text-text-muted">Enter your credentials to continue your journey</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-muted flex items-center gap-2">
                            <Mail size={16} /> Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-muted flex items-center gap-2">
                            <Lock size={16} /> Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary w-full py-4 text-lg mt-4 flex items-center justify-center gap-2">
                        <LogIn size={20} /> Sign In
                    </button>
                </form>

                <p className="text-center mt-8 text-text-muted">
                    Don't have an account? <Link to="/register" className="text-primary font-bold hover:underline">Register</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
