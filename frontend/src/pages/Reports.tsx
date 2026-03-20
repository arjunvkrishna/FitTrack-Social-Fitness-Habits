import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Activity, Moon, Flame, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';

const Reports = () => {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const res = await axios.get('/api/health/reports');
            setReports(res.data);
        } catch (err) {
            console.error('Error fetching reports', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div></div>;
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-6xl mx-auto space-y-6"
        >
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-4xl font-bold gradient-text">Health Reports</h1>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {reports.map((report, index) => {
                    const foodCalories = report.foods?.reduce((sum: number, f: any) => sum + f.calories, 0) || 0;

                    return (
                        <div key={index} className="glass p-6 hover:border-white/10 transition-colors">
                            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                                <div className="flex items-center gap-3">
                                    <Calendar className="text-primary" />
                                    <h3 className="text-xl font-bold">{format(new Date(report.dateStr), 'MMM d, yyyy')}</h3>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-white/5 rounded-xl p-4 flex items-center gap-4">
                                    <CheckCircle2 className="text-green-400" size={32} />
                                    <div>
                                        <p className="text-sm text-text-muted">Steps</p>
                                        <p className="text-xl font-bold">{report.steps || 0}</p>
                                    </div>
                                </div>

                                <div className="bg-white/5 rounded-xl p-4 flex items-center gap-4">
                                    <Moon className="text-purple-400" size={32} />
                                    <div>
                                        <p className="text-sm text-text-muted">Sleep</p>
                                        <p className="text-xl font-bold">{report.sleepHours || 0} hrs</p>
                                    </div>
                                </div>

                                <div className="bg-white/5 rounded-xl p-4 flex items-center gap-4">
                                    <Flame className="text-orange-400" size={32} />
                                    <div>
                                        <p className="text-sm text-text-muted">Food Intake</p>
                                        <p className="text-xl font-bold">{foodCalories} kcal</p>
                                    </div>
                                </div>

                                <div className="bg-white/5 rounded-xl p-4 flex flex-col gap-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-muted">Items Logged:</span>
                                        <span className="font-bold">{report.foods?.length || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {reports.length === 0 && (
                    <div className="text-center py-12 glass">
                        <Activity size={48} className="mx-auto text-text-muted mb-4 opacity-50" />
                        <h3 className="text-xl font-semibold mb-2">No Reports Yet</h3>
                        <p className="text-text-muted">Start tracking your daily health on the dashboard to see history here.</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default Reports;
