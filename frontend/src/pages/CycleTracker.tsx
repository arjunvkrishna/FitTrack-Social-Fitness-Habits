import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, AlertCircle, Info, ChevronRight, ChevronLeft, Droplets, Heart } from 'lucide-react';
import { format, addDays, getDaysInMonth, startOfMonth, getDay } from 'date-fns';

const CycleTracker = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const nextPeriod = addDays(new Date(), 14);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-6xl mx-auto space-y-6"
        >
            <div className="flex items-center justify-between">
                <h1 className="text-4xl font-bold gradient-text">Cycle Insights</h1>
                <div className="flex gap-4">
                    <div className="glass px-4 py-2 rounded-full flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-secondary"></div>
                        <span className="text-sm font-medium">Period Prediction</span>
                    </div>
                    <div className="glass px-4 py-2 rounded-full flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-accent"></div>
                        <span className="text-sm font-medium">Ovulation Window</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Prediction Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass p-8 bg-gradient-to-br from-secondary/10 to-transparent">
                        <h3 className="text-text-muted font-medium mb-1">Next Cycle Starts In</h3>
                        <div className="flex items-baseline gap-2 mb-6">
                            <span className="text-6xl font-black text-secondary">14</span>
                            <span className="text-xl font-bold">Days</span>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl flex items-center gap-4 border border-white/10">
                            <Calendar className="text-secondary" />
                            <div>
                                <p className="text-sm font-bold">{format(nextPeriod, 'MMMM d, yyyy')}</p>
                                <p className="text-xs text-text-muted">Estimated Start Date</p>
                            </div>
                        </div>
                    </div>

                    <div className="glass p-6">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <Heart className="text-red-400" size={20} /> Today's Focus
                        </h3>
                        <p className="text-sm text-text-muted leading-relaxed">
                            Your estrogen levels are rising. A great time for high-intensity training or collaborative Social Bucket List goals!
                        </p>
                    </div>
                </div>

                {/* Calendar Card */}
                <div className="lg:col-span-2 glass p-8 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-bold">{format(new Date(), 'MMMM yyyy')}</h3>
                        <div className="flex gap-2">
                            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors border border-white/5">
                                <ChevronLeft size={20} />
                            </button>
                            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors border border-white/5">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-4 mb-4">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                            <div key={day} className="text-center text-text-muted text-xs font-bold uppercase tracking-widest">{day}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-4">
                        {Array.from({ length: 30 }).map((_, i) => (
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                key={i}
                                className={`
                  aspect-square rounded-2xl flex items-center justify-center text-sm font-semibold cursor-pointer transition-all
                  ${i + 1 >= 10 && i + 1 <= 14 ? 'bg-secondary/20 text-secondary border border-secondary/30' : 'bg-white/5 hover:bg-white/10 border border-white/5'}
                  ${i + 1 === 12 ? 'ring-2 ring-secondary ring-offset-4 ring-offset-background' : ''}
                `}
                            >
                                {i + 1}
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/5 flex gap-8">
                        <div className="flex items-center gap-4">
                            <button className="btn-primary px-8">Log Period Start</button>
                            <button className="bg-white/5 hover:bg-white/10 p-4 rounded-2xl transition-all border border-white/5">
                                <Droplets />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default CycleTracker;
