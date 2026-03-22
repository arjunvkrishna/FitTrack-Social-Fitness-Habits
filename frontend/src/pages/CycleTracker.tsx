import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, AlertCircle, Info, ChevronRight, ChevronLeft, Droplets, Heart, Activity, ShieldAlert, Sparkles, TrendingUp, Thermometer } from 'lucide-react';
import { format, addDays, getDaysInMonth, startOfMonth, getDay, differenceInDays, isSameDay, startOfDay } from 'date-fns';
import axios from 'axios';
import MenstrualLogForm from '../components/MenstrualLogForm';

const CycleTracker = () => {
    const [status, setStatus] = useState<any>(null);
    const [insights, setInsights] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [showLogForm, setShowLogForm] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        fetchCycleData();
    }, []);

    const fetchCycleData = async () => {
        try {
            const [statusRes, histRes, insightsRes] = await Promise.all([
                axios.get('/api/cycle/status'),
                axios.get('/api/cycle/history'),
                axios.get('/api/cycle/insights')
            ]);
            setStatus(statusRes.data);
            setHistory(histRes.data);
            setInsights(insightsRes.data);
        } catch (err) {
            console.error('Error fetching cycle data:', err);
        }
    };

    const handleLogPeriodStart = async () => {
        try {
            await axios.post('/api/cycle', { startDate: format(new Date(), 'yyyy-MM-dd') });
            fetchCycleData();
        } catch (err) {
            console.error('Error logging period start:', err);
        }
    };

    const prediction = status?.prediction;
    const nextPeriod = prediction?.predictedDate ? new Date(prediction.predictedDate) : null;
    const daysUntil = nextPeriod ? differenceInDays(nextPeriod, new Date()) : '--';

    const renderConfidenceBadge = () => {
        if (!prediction) return null;
        const colors: any = {
            'VERY_HIGH': 'bg-green-500/20 text-green-400 border-green-500/30',
            'HIGH': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            'MODERATE': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            'LOW': 'bg-red-500/20 text-red-400 border-red-500/30'
        };

        return (
            <div className={`px-3 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5 ${colors[prediction.confidence]}`}>
                <Activity size={12} />
                {prediction.confidence.replace('_', ' ')} CONFIDENCE ({prediction.signal})
            </div>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-6xl mx-auto space-y-6"
        >
            {/* Header & Disclaimer */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold gradient-text">Cycle Insights</h1>
                    <div className="flex items-center gap-2 mt-2">
                         <ShieldAlert className="text-orange-500" size={16} />
                         <span className="text-[10px] uppercase font-black text-orange-500/80 tracking-tighter">
                             NOT FOR CONTRACEPTION • {status?.disclaimer}
                         </span>
                    </div>
                </div>
                {renderConfidenceBadge()}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Prediction Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass p-8 bg-gradient-to-br from-secondary/10 to-transparent relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Sparkles size={120} />
                        </div>
                        <h3 className="text-text-muted font-medium mb-1">Next Cycle Starts In</h3>
                        <div className="flex items-baseline gap-2 mb-6">
                            <span className="text-6xl font-black text-secondary">{daysUntil}</span>
                            <span className="text-xl font-bold">Days</span>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl flex items-center gap-4 border border-white/10">
                            <Calendar className="text-secondary" />
                            <div>
                                <p className="text-sm font-bold">{nextPeriod ? format(nextPeriod, 'MMMM d, yyyy') : '--'}</p>
                                <p className="text-xs text-text-muted">Estimated Start Date</p>
                            </div>
                        </div>
                    </div>

                    {/* Phase Card */}
                    <div className="glass p-6 border-l-4 border-primary">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold flex items-center gap-2">
                                <Activity className="text-primary" size={20} /> Current Phase
                            </h3>
                            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest">{status?.phase || 'Unknown'}</span>
                        </div>
                        <p className="text-sm text-text-muted leading-relaxed">
                            {status?.phase === 'FOLLICULAR' && "Estrogen is rising. Your energy and focus are peaking—great for complex goals!"}
                            {status?.phase === 'OVULATORY' && "Ovulation is likely near. Use OPK and BBT tracking for high-confidence insights."}
                            {status?.phase === 'LUTEAL' && "Progesterone is high. Prioritize recovery and sleep quality this week."}
                            {status?.phase === 'MENSTRUAL' && "Rest and hydration are key. Log your flow and symptoms to improve future accuracy."}
                            {!status?.phase && "Log your last period to start receiving personalized phase insights."}
                        </p>
                    </div>

                    {/* Insights Panel */}
                    <div className="glass p-6">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <TrendingUp className="text-accent" size={20} /> Personal Patterns
                        </h3>
                        {insights?.hasEnoughData ? (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-text-muted">Avg Luteal Phase</span>
                                    <span className="font-bold">{insights.avgLutealLength || '--'} Days</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-text-muted">Cycle Regularity</span>
                                    <span className={`font-bold ${insights.regularity === 'HIGH' ? 'text-green-400' : 'text-yellow-400'}`}>
                                        {insights.regularity}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-text-muted">Typical PMS Onset</span>
                                    <span className="font-bold">Day {insights.typicalPMSOnset || '--'}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-xs text-text-muted italic leading-relaxed">
                                    {insights?.message || "Log 3+ cycles to unlock personalized insights and trend analysis."}
                                </p>
                                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-accent/30 w-1/3"></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Calendar Card */}
                <div className="lg:col-span-2 glass p-8 relative overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-bold">{format(new Date(), 'MMMM yyyy')}</h3>
                        <div className="flex gap-2 text-text-muted">
                            <div className="flex items-center gap-1.5 px-3 py-1 border border-white/5 rounded-full text-[10px] font-bold">
                                <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div> Prediction
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1 border border-white/5 rounded-full text-[10px] font-bold">
                                <div className="w-1.5 h-1.5 rounded-full bg-accent"></div> Fertile Window
                            </div>
                        </div>
                    </div>

                    {/* Simplified Calendar Implementation */}
                    <div className="grid grid-cols-7 gap-4 mb-4">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                            <div key={day} className="text-center text-text-muted text-xs font-bold uppercase tracking-widest">{day}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-4 flex-1">
                        {Array.from({ length: 31 }).map((_, i) => {
                            const date = new Date(new Date().getFullYear(), new Date().getMonth(), i + 1);
                            const isPredictionDay = nextPeriod && isSameDay(date, nextPeriod);
                            const isToday = isSameDay(date, new Date());
                            
                            return (
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    key={i}
                                    onClick={() => {
                                        setSelectedDate(date);
                                        setShowLogForm(true);
                                    }}
                                    className={`
                                        aspect-square rounded-2xl flex items-center justify-center text-sm font-semibold cursor-pointer transition-all border
                                        ${isPredictionDay ? 'bg-secondary/20 text-secondary border-secondary/30' : 'bg-white/5 hover:bg-white/10 border-white/5'}
                                        ${isToday ? 'ring-2 ring-primary ring-offset-4 ring-offset-background' : ''}
                                    `}
                                >
                                    {i + 1}
                                </motion.div>
                            );
                        })}
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/5 flex flex-wrap gap-4">
                        <button onClick={handleLogPeriodStart} className="btn-primary px-8 flex items-center gap-2">
                            <Droplets size={18} /> Log Period Start
                        </button>
                        <button 
                            onClick={() => {
                                setSelectedDate(new Date());
                                setShowLogForm(true);
                            }}
                            className="bg-white/5 hover:bg-white/10 px-8 py-3 rounded-2xl transition-all border border-white/5 font-bold flex items-center gap-2"
                        >
                            <Thermometer size={18} className="text-accent" /> Log Daily Signals
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showLogForm && (
                    <MenstrualLogForm
                        date={selectedDate}
                        phase={status?.phase || 'FOLLICULAR'}
                        onClose={() => setShowLogForm(false)}
                        onSaveSuccess={fetchCycleData}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default CycleTracker;

