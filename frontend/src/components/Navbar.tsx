import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Droplets, Trophy, User as UserIcon, LogOut, Calendar, Shield, Users, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const getLinkClass = (path: string) => {
        const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
        return `flex items-center gap-2 px-4 py-2 rounded-full transition-all relative z-10 ${isActive ? 'text-white font-medium' : 'text-text-muted hover:text-white'}`;
    };

    return (
        <div className="w-full flex justify-center sticky top-6 z-50 px-4 pointer-events-none">
            <nav className="glass-nav px-3 py-2 flex items-center justify-between pointer-events-auto shadow-2xl backdrop-blur-3xl border border-white/10 w-full max-w-5xl">
                <Link to="/" className="flex items-center gap-2 px-3 py-1 group">
                    <div className="p-1.5 bg-gradient-to-tr from-primary to-secondary rounded-full group-hover:rotate-12 transition-transform shadow-lg shadow-primary/30">
                        <Activity className="text-white" size={20} />
                    </div>
                    <span className="text-xl font-bold gradient-text tracking-tight">FitTrack</span>
                </Link>

                <div className="flex items-center gap-2">
                    {user ? (
                        <>
                            <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5">
                                {[
                                    { path: '/', icon: <Activity size={18} />, label: 'Overview' },
                                    { path: '/reports', icon: <Calendar size={18} />, label: 'Reports' },
                                    { path: '/exercises', icon: <Trophy size={18} />, label: 'Exercises' },
                                    { path: '/feed', icon: <Users size={18} />, label: 'Feed' },
                                ].map(link => (
                                    <Link key={link.path} to={link.path} className={getLinkClass(link.path)}>
                                        {location.pathname === link.path && (
                                            <motion.div layoutId="nav-indicator" className="absolute inset-0 bg-white/10 rounded-full -z-10" transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} />
                                        )}
                                        {link.icon}
                                        <span className="text-sm">{link.label}</span>
                                    </Link>
                                ))}
                                {user.gender === 'FEMALE' && (
                                    <Link to="/cycle" className={getLinkClass('/cycle')}>
                                        {location.pathname === '/cycle' && (
                                            <motion.div layoutId="nav-indicator" className="absolute inset-0 bg-white/10 rounded-full -z-10" />
                                        )}
                                        <Calendar size={18} className="text-secondary" />
                                        <span className="text-sm">Cycle</span>
                                    </Link>
                                )}
                                {user.role === 'ADMIN' && (
                                    <Link to="/admin" className={getLinkClass('/admin')}>
                                        {location.pathname === '/admin' && (
                                            <motion.div layoutId="nav-indicator" className="absolute inset-0 bg-white/10 rounded-full -z-10" />
                                        )}
                                        <Shield size={18} className="text-warning" />
                                        <span className="text-sm">Admin</span>
                                    </Link>
                                )}
                            </div>
                            
                            <div className="h-6 w-px bg-white/10 mx-2 hidden sm:block"></div>
                            
                            <div className="flex items-center gap-3">
                                <Link to="/profile" className="flex items-center gap-2 hover:bg-white/10 px-3 py-1.5 rounded-full transition-colors group border border-transparent hover:border-white/10">
                                    <div className="text-right hidden lg:block">
                                        <p className="text-sm font-semibold leading-tight">{user.name}</p>
                                        <p className="text-xs text-accent font-medium leading-tight">{user.points} pts</p>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                        <UserIcon size={16} />
                                    </div>
                                </Link>
                                <button onClick={logout} className="p-2 hover:bg-red-500/20 hover:text-red-400 text-text-muted rounded-full transition-colors hidden sm:block">
                                    <LogOut size={18} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex gap-3">
                            <Link to="/login" className="px-4 py-2 text-sm font-medium text-text-muted hover:text-white transition-colors">Login</Link>
                            <Link to="/register" className="btn-primary py-2 px-5 text-sm">Join Now</Link>
                        </div>
                    )}
                </div>
            </nav>
        </div>
    );
};

export default Navbar;
