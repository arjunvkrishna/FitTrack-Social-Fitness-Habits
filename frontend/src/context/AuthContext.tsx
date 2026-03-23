import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface User {
    id: string;
    name: string;
    username: string;
    email: string;
    role: string;
    gender?: string;
    points: number;
    profilePicture?: string;
    privacySettings?: {
        showProfilePicture: string;
        showAchievements: string;
        showStats: string;
    };
    streaks: any;
    waterGoal?: number;
    telegramChatId?: string;
    reminderFrequency?: number;
    dndEnabled?: boolean;
    dndStart?: string;
    dndEnd?: string;
    restTimerSettings?: {
        defaultDuration: number;
        autoStart: boolean;
        alertType: 'sound' | 'visual' | 'both';
    };
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
    checkSetupRequired: () => Promise<boolean>;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            axios.defaults.headers.common['X-User-ID'] = user.id || (user as any)._id;
        } else {
            delete axios.defaults.headers.common['X-User-ID'];
        }
        setLoading(false);
    }, [user]);

    const login = async (email: string, password: string) => {
        const res = await axios.post('/api/auth/login', { email, password });
        const { user } = res.data;
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        navigate('/');
    };

    const register = async (data: any) => {
        const res = await axios.post('/api/auth/register', data);
        const { user } = res.data;
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        navigate('/');
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['X-User-ID'];
        navigate('/login');
    };

    const checkSetupRequired = async (): Promise<boolean> => {
        try {
            const res = await axios.get('/api/auth/setup-status');
            return res.data.setupRequired;
        } catch (err) {
            console.error('Error checking setup status', err);
            return false;
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, checkSetupRequired, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
