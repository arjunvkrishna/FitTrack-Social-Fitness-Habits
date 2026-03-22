import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Droplets, Trophy, User as UserIcon, LogOut, Calendar, Shield, Users, Plus } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="glass sticky top-4 z-50 mx-4 mt-4 px-6 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
                <div className="p-2 bg-primary rounded-xl group-hover:rotate-12 transition-transform">
                    <Activity className="text-white" size={24} />
                </div>
                <span className="text-xl font-bold gradient-text">FitTrack</span>
            </Link>

            <div className="flex items-center gap-6">
                {user ? (
                    <>
                        <Link to="/" className="flex items-center gap-2 text-text-muted hover:text-white transition-colors">
                            <Activity size={20} />
                            <span>Dashboard</span>
                        </Link>
                        <Link to="/reports" className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors">
                            <Calendar size={20} />
                            <span>Reports</span>
                        </Link>
                        <Link to="/exercises" className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors">
                            <Trophy size={20} />
                            <span>Exercises</span>
                        </Link>
                        <Link to="/templates" className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors">
                            <Plus size={20} />
                            <span>Templates</span>
                        </Link>
                        <Link to="/feed" className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors">
                            <Users size={20} />
                            <span>Feed</span>
                        </Link>
                        {user.gender === 'FEMALE' && (
                            <Link to="/cycle" className="flex items-center gap-2 text-text-muted hover:text-secondary transition-colors">
                                <Calendar size={20} />
                                <span>Cycle</span>
                            </Link>
                        )}
                        {user.role === 'ADMIN' && (
                            <Link to="/admin" className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors">
                                <Shield size={20} />
                                <span>Admin</span>
                            </Link>
                        )}
                        <div className="h-6 w-px bg-surface-border"></div>
                        <div className="flex items-center gap-4">
                            <Link to="/profile" className="p-2 hover:bg-surface-border rounded-xl transition-colors group">
                                <UserIcon size={20} className="text-text-muted group-hover:text-primary transition-colors" />
                            </Link>
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold">{user.name}</p>
                                <p className="text-xs text-accent">{user.points} pts</p>
                            </div>
                            <button onClick={logout} className="p-2 hover:bg-surface-border rounded-xl transition-colors">
                                <LogOut size={20} className="text-text-muted" />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex gap-4">
                        <Link to="/login" className="text-text-muted hover:text-white pt-2">Login</Link>
                        <Link to="/register" className="btn-primary">Get Started</Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
