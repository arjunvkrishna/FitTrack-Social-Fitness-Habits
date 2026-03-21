import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { User, Lock, Camera, Eye, Shield, Save, EyeOff, Send, Info } from 'lucide-react';

const Profile = () => {
    const { user, login } = useAuth(); // We'll use a hack to update the user in context by re-fetching or just manual update
    const [formData, setFormData] = useState({
        name: user?.name || '',
        username: user?.username || '',
        gender: user?.gender || 'OTHER',
        profilePicture: user?.profilePicture || '',
        telegramChatId: user?.telegramChatId || '',
        reminderFrequency: user?.reminderFrequency || 60,
        dndEnabled: user?.dndEnabled || false,
        dndStart: user?.dndStart || '22:00',
        dndEnd: user?.dndEnd || '07:00',
        privacySettings: user?.privacySettings || {
            showProfilePicture: 'PUBLIC',
            showAchievements: 'PUBLIC',
            showStats: 'PUBLIC'
        }
    });

    React.useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                username: user.username || '',
                gender: (user.gender as any) || 'OTHER',
                profilePicture: user.profilePicture || '',
                telegramChatId: user.telegramChatId || '',
                reminderFrequency: user.reminderFrequency || 60,
                dndEnabled: user.dndEnabled || false,
                dndStart: user.dndStart || '22:00',
                dndEnd: user.dndEnd || '07:00',
                privacySettings: user.privacySettings || {
                    showProfilePicture: 'PUBLIC',
                    showAchievements: 'PUBLIC',
                    showStats: 'PUBLIC'
                }
            });
        }
    }, [user]);

    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [status, setStatus] = useState({ type: '', message: '' });

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.put('/api/users/profile', formData, {
                headers: { 'X-User-ID': user?.id || (user as any)?._id }
            });
            setStatus({ type: 'success', message: 'Profile updated successfully!' });
            // Update local storage and context could be done here if we had a proper 'updateUser' in AuthContext
            localStorage.setItem('user', JSON.stringify(res.data));
            window.location.reload(); // Simple way to refresh context for now
        } catch (err: any) {
            setStatus({ type: 'error', message: err.response?.data?.message || 'Update failed' });
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            return setStatus({ type: 'error', message: 'Passwords do not match' });
        }
        try {
            await axios.put('/api/users/password', {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            }, {
                headers: { 'X-User-ID': user?.id || (user as any)?._id }
            });
            setStatus({ type: 'success', message: 'Password reset successfully!' });
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            setStatus({ type: 'error', message: err.response?.data?.message || 'Password reset failed' });
        }
    };

    return (
        <div className="container py-8 px-4 max-w-4xl mx-auto">
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-bold mb-8 gradient-text"
            >
                Account Settings
            </motion.h1>

            {status.message && (
                <div className={`p-4 mb-6 rounded-xl glass ${status.type === 'success' ? 'border-accent text-accent' : 'border-secondary text-secondary'}`}>
                    {status.message}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Profile Pic & Info */}
                <div className="space-y-6">
                    <div className="glass p-6 text-center">
                        <div className="relative inline-block mb-4">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 bg-white/5 flex items-center justify-center">
                                {formData.profilePicture ? (
                                    <img src={formData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={64} className="text-text-muted" />
                                )}
                            </div>
                            <button className="absolute bottom-0 right-0 p-2 bg-primary rounded-full text-white hover:bg-primary-hover transition-colors shadow-lg">
                                <Camera size={16} />
                            </button>
                        </div>
                        <h2 className="text-xl font-bold">{formData.name}</h2>
                        <p className="text-text-muted">@{formData.username}</p>
                    </div>

                    <div className="glass p-6 space-y-4">
                        <h3 className="font-bold flex items-center gap-2">
                            <Shield size={18} className="text-primary" /> Privacy Settings
                        </h3>
                        {Object.keys(formData.privacySettings).map((key) => (
                            <div key={key} className="space-y-1">
                                <label className="text-xs text-text-muted uppercase tracking-widest">
                                    {key.replace('show', '').replace(/([A-Z])/g, ' $1')} Visibility
                                </label>
                                <select
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm outline-none"
                                    value={(formData.privacySettings as any)[key]}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        privacySettings: { ...formData.privacySettings, [key]: e.target.value }
                                    })}
                                >
                                    <option value="PUBLIC">Public</option>
                                    <option value="FRIENDS">Friends Only</option>
                                    <option value="PRIVATE">Private</option>
                                </select>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Edit Forms */}
                <div className="md:col-span-2 space-y-8">
                    {/* General Profile */}
                    <div className="glass p-8">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <User size={20} className="text-primary" /> Edit Profile
                        </h3>
                        <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text-muted">Full Name</label>
                                <input
                                    type="text"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text-muted">Username</label>
                                <input
                                    type="text"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s/g, '') })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text-muted">Gender</label>
                                <select
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
                                    value={formData.gender}
                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                                >
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text-muted">Profile Picture URL</label>
                                <input
                                    type="text"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="https://example.com/photo.jpg"
                                    value={formData.profilePicture}
                                    onChange={(e) => setFormData({ ...formData, profilePicture: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-text-muted flex items-center gap-2">
                                    <Send size={14} className="text-primary" /> Telegram Chat ID (for Hydration Reminders)
                                </label>
                                <div className="flex gap-4">
                                    <input
                                        type="text"
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary font-mono"
                                        placeholder="Enter your Telegram Chat ID (e.g. 123456789)"
                                        value={formData.telegramChatId}
                                        onChange={(e) => setFormData({ ...formData, telegramChatId: e.target.value })}
                                    />
                                </div>
                                <p className="text-xs text-text-muted flex items-center gap-1.5 mt-1">
                                    <Info size={12} className="text-primary" />
                                    Don't know your ID? Send a message to <a href="https://t.me/userinfobot" target="_blank" rel="noreferrer" className="text-primary hover:underline">@userinfobot</a> on Telegram.
                                </p>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-text-muted flex items-center gap-2">
                                    <Send size={14} className="text-primary" /> Reminder Frequency (Minutes)
                                </label>
                                <select
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
                                    value={formData.reminderFrequency}
                                    onChange={(e) => setFormData({ ...formData, reminderFrequency: parseInt(e.target.value) })}
                                >
                                    <option value="15">15 Minutes</option>
                                    <option value="30">30 Minutes</option>
                                    <option value="45">45 Minutes</option>
                                    <option value="60">1 Hour</option>
                                    <option value="90">1.5 Hours</option>
                                    <option value="120">2 Hours</option>
                                </select>
                            </div>
                            <div className="space-y-4 md:col-span-2 p-4 rounded-xl bg-white/5 border border-white/10">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            <EyeOff size={14} className="text-primary" /> Do Not Disturb (DND) Mode
                                        </label>
                                        <p className="text-xs text-text-muted">Pause hydration reminders during specific hours.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, dndEnabled: !formData.dndEnabled })}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.dndEnabled ? 'bg-primary' : 'bg-white/20'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.dndEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                                {formData.dndEnabled && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="grid grid-cols-2 gap-4 mt-4"
                                    >
                                        <div className="space-y-2">
                                            <label className="text-xs text-text-muted uppercase tracking-widest">DND Start Time</label>
                                            <input
                                                type="time"
                                                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                                                value={formData.dndStart}
                                                onChange={(e) => setFormData({ ...formData, dndStart: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs text-text-muted uppercase tracking-widest">DND End Time</label>
                                            <input
                                                type="time"
                                                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                                                value={formData.dndEnd}
                                                onChange={(e) => setFormData({ ...formData, dndEnd: e.target.value })}
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                            <div className="md:col-span-2">
                                <button type="submit" className="btn-primary gap-2">
                                    <Save size={18} /> Save Changes
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Reset Password */}
                    <div className="glass p-8">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Lock size={20} className="text-primary" /> Security & Password
                        </h3>
                        <form onSubmit={handleUpdatePassword} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-text-muted">Current Password</label>
                                    <input
                                        type="password"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
                                        required
                                        value={passwords.currentPassword}
                                        onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                    />
                                </div>
                                <div className="hidden md:block"></div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-text-muted">New Password</label>
                                    <input
                                        type="password"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
                                        required
                                        value={passwords.newPassword}
                                        onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-text-muted">Confirm New Password</label>
                                    <input
                                        type="password"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
                                        required
                                        value={passwords.confirmPassword}
                                        onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                    />
                                </div>
                            </div>
                            <button type="submit" className="btn-primary gap-2">
                                <Lock size={18} /> Update Password
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
