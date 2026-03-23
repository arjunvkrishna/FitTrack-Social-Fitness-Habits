import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, RefreshCw, Dumbbell, Users, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Navbar: React.FC = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    if (!user) return null;

    const navItems = [
        { path: '/', icon: Home, label: 'Dashboard' },
        { path: '/exercises', icon: Dumbbell, label: 'Exercises' },
        { path: '/cycle', icon: RefreshCw, label: 'Cycle' },
        { path: '/feed', icon: Users, label: 'Community' },
        { path: '/profile', icon: User, label: 'Profile' },
    ];

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
            {/* The Dock Container */}
            <motion.nav 
                className="bg-white/90 backdrop-blur-xl border border-white/50 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] rounded-[2rem] px-4 py-3 flex items-center justify-center gap-2 md:gap-4 pointer-events-auto"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;

                    return (
                        <Link key={item.path} to={item.path} className="relative group outline-none">
                            <motion.div
                                className={`flex items-center justify-center w-14 h-14 rounded-2xl transition-colors duration-300 ${
                                    isActive 
                                    ? 'bg-slate-100 text-blue-600 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)]' 
                                    : 'bg-transparent text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                                }`}
                                whileHover={{ scale: 1.3, y: -10 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                            >
                                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            </motion.div>
                            
                            {/* Tooltip */}
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap pointer-events-none shadow-lg">
                                {item.label}
                            </div>
                            
                            {/* Active Dot indicator */}
                            {isActive && (
                                <motion.div 
                                    layoutId="activeDockIndicator"
                                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-500"
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                />
                            )}
                        </Link>
                    );
                })}

                <div className="w-px h-8 bg-slate-200 mx-1 rounded-full" />

                {/* Logout Button */}
                <button onClick={logout} className="relative group outline-none">
                    <motion.div
                        className="flex items-center justify-center w-14 h-14 rounded-2xl bg-transparent text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors duration-300"
                        whileHover={{ scale: 1.3, y: -10 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    >
                        <LogOut size={24} strokeWidth={2} />
                    </motion.div>
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap pointer-events-none shadow-lg">
                        Logout
                    </div>
                </button>
            </motion.nav>
        </div>
    );
};

export default Navbar;
