import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Thermometer, Droplets, Info, AlertCircle, Save, Calendar, Activity, Zap, Moon, Smile, Heart, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';

interface Props {
    date: Date;
    phase: 'MENSTRUAL' | 'FOLLICULAR' | 'OVULATORY' | 'LUTEAL';
    onClose: () => void;
    onSaveSuccess: () => void;
}

const DISCLAIMER = "FitTrack is NOT a contraceptive method. DO NOT use for birth control.";

const MenstrualLogForm: React.FC<Props> = ({ date, phase, onClose, onSaveSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<any>({
        bbt: '',
        bbtFlags: [],
        cervicalMucus: 'NONE',
        opkResult: 'NEGATIVE',
        symptoms: {
            cramping: 'NONE',
            bloating: false,
            breastTenderness: false,
            headache: false,
            acne: false,
            nausea: false,
            spotting: false,
        },
        vitals: {
            energyLevel: 3,
            mood: '',
            libido: 'MEDIUM',
            stress: 3,
            sleepQuality: 3,
        },
        notes: ''
    });

    useEffect(() => {
        const fetchLog = async () => {
            try {
                const res = await axios.get(`/api/cycle/daily?date=${format(date, 'yyyy-MM-dd')}`);
                if (res.data && res.data._id) {
                    setFormData(res.data);
                }
            } catch (err) {
                console.error('Error fetching daily log:', err);
            }
        };
        fetchLog();
    }, [date]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('/api/cycle/daily', { ...formData, date: format(date, 'yyyy-MM-dd') });
            onSaveSuccess();
            onClose();
        } catch (err) {
            console.error('Error saving daily log:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleFlag = (flag: string) => {
        setFormData((prev: any) => ({
            ...prev,
            bbtFlags: prev.bbtFlags.includes(flag) 
                ? prev.bbtFlags.filter((f: string) => f !== flag)
                : [...prev.bbtFlags, flag]
        }));
    };

    // Phase-Aware Surface Rules
    const renderPhaseSpecificFields = () => {
        switch (phase) {
            case 'OVULATORY':
            case 'FOLLICULAR':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <label className="text-sm font-bold flex items-center gap-2">
                                <Activity size={16} className="text-primary" /> OPK Result (High Confidence Prediction)
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {['NEGATIVE', 'POSITIVE', 'PEAK'].map(res => (
                                    <button
                                        key={res}
                                        type="button"
                                        onClick={() => setFormData({...formData, opkResult: res})}
                                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${formData.opkResult === res ? 'bg-primary text-white scale-105' : 'bg-white/5 text-text-muted'}`}
                                    >
                                        {res}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="text-sm font-bold flex items-center gap-2">
                                <Droplets size={16} className="text-blue-400" /> Cervical Mucus Stage
                            </label>
                            <select 
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
                                value={formData.cervicalMucus}
                                onChange={(e) => setFormData({...formData, cervicalMucus: e.target.value})}
                            >
                                <option value="NONE">None</option>
                                <option value="STICKY">Sticky</option>
                                <option value="CREAMY">Creamy</option>
                                <option value="WATERY">Watery</option>
                                <option value="EGG_WHITE">Egg-White (Fertile)</option>
                            </select>
                        </div>
                    </div>
                );
            case 'LUTEAL':
                return (
                    <div className="space-y-4">
                        <label className="text-sm font-bold flex items-center gap-2">
                            <Zap size={16} className="text-orange-400" /> Progesterone Effects
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {['breastTenderness', 'bloating', 'acne', 'mood'].map(field => (
                                <button
                                    key={field}
                                    type="button"
                                    onClick={() => setFormData({
                                        ...formData, 
                                        symptoms: field === 'mood' ? formData.symptoms : { ...formData.symptoms, [field]: !formData.symptoms[field] }
                                    })}
                                    className={`px-4 py-3 rounded-xl text-sm font-medium border border-white/5 flex items-center justify-between ${formData.symptoms[field] ? 'bg-orange-400/20 text-orange-400 border-orange-400/30' : 'bg-white/5 text-text-muted'}`}
                                >
                                    {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                    <div className={`w-2 h-2 rounded-full ${formData.symptoms[field] ? 'bg-orange-400' : 'bg-white/20'}`}></div>
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 'MENSTRUAL':
                return (
                    <div className="space-y-4">
                       <label className="text-sm font-bold flex items-center gap-2 text-rose-400">
                           <Droplets size={16} /> Period Symptoms
                       </label>
                       <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                               <p className="text-xs text-text-muted">Cramping Severity</p>
                               <div className="flex gap-2">
                               {['NONE', 'MILD', 'MODERATE', 'SEVERE'].map(lev => (
                                   <button 
                                       key={lev}
                                       type="button"
                                       onClick={() => setFormData({...formData, symptoms: {...formData.symptoms, cramping: lev}})}
                                       className={`flex-1 p-2 rounded-lg text-[10px] font-bold ${formData.symptoms.cramping === lev ? 'bg-rose-500 text-white' : 'bg-white/5'}`}
                                   >
                                       {lev}
                                   </button>
                               ))}
                               </div>
                           </div>
                           <button
                                type="button"
                                onClick={() => setFormData({...formData, symptoms: {...formData.symptoms, spotting: !formData.symptoms.spotting}})}
                                className={`px-4 py-3 rounded-xl text-sm font-medium border border-white/5 flex items-center justify-between ${formData.symptoms.spotting ? 'bg-rose-500/20 text-rose-500 border-rose-500/30' : 'bg-white/5 text-text-muted'}`}
                            >
                                Spotting
                                <div className={`w-2 h-2 rounded-full ${formData.symptoms.spotting ? 'bg-rose-500' : 'bg-white/20'}`}></div>
                            </button>
                       </div>
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-background/80 backdrop-blur-md">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 relative"
            >
                <button onClick={onClose} className="absolute right-6 top-6 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-all">
                    <X size={20} />
                </button>

                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                        <Calendar size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">{format(date, 'MMMM do, yyyy')}</h2>
                        <p className="text-sm font-medium text-primary uppercase tracking-widest">{phase} Phase</p>
                    </div>
                </div>

                <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 mb-8 flex items-start gap-4">
                    <AlertCircle className="text-orange-500 shrink-0" size={20} />
                    <p className="text-xs font-medium text-orange-200/80 leading-relaxed italic">{DISCLAIMER}</p>
                </div>

                <form onSubmit={handleSave} className="space-y-8">
                    {/* BBT Section - Always visible but weighted */}
                    <div className="space-y-4">
                        <label className="text-sm font-bold flex items-center justify-between">
                            <span className="flex items-center gap-2"><Thermometer size={16} className="text-accent" /> Basal Body Temp (BBT)</span>
                            {formData.bbt && <span className="text-accent text-xs font-mono">{formData.bbt}°C</span>}
                        </label>
                        <div className="flex gap-4">
                            <input
                                type="number"
                                step="0.01"
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary font-mono"
                                placeholder="e.g. 36.50"
                                value={formData.bbt}
                                onChange={(e) => setFormData({...formData, bbt: e.target.value})}
                            />
                            <div className="flex gap-2">
                                {['ILLNESS', 'ALCOHOL', 'POOR_SLEEP'].map(flag => (
                                    <button
                                        key={flag}
                                        type="button"
                                        onClick={() => toggleFlag(flag)}
                                        className={`p-2 rounded-xl border border-white/5 text-[10px] font-bold ${formData.bbtFlags.includes(flag) ? 'bg-accent/20 text-accent border-accent/30' : 'bg-white/5 text-text-muted'}`}
                                        title={flag.replace('_', ' ')}
                                    >
                                        {flag === 'ILLNESS' ? '🤒' : flag === 'ALCOHOL' ? '🍷' : '😴'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {renderPhaseSpecificFields()}

                    {/* General Vitals & Vitals */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                             <label className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Energy</label>
                             <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl border border-white/10">
                                 <Zap size={14} className="text-yellow-400" />
                                 <input type="range" min="1" max="5" value={formData.vitals.energyLevel} onChange={(e) => setFormData({...formData, vitals: {...formData.vitals, energyLevel: parseInt(e.target.value)}})} className="w-full accent-primary" />
                             </div>
                        </div>
                        <div className="space-y-2">
                             <label className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Sleep</label>
                             <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl border border-white/10">
                                 <Moon size={14} className="text-indigo-400" />
                                 <input type="range" min="1" max="5" value={formData.vitals.sleepQuality} onChange={(e) => setFormData({...formData, vitals: {...formData.vitals, sleepQuality: parseInt(e.target.value)}})} className="w-full accent-primary" />
                             </div>
                        </div>
                        <div className="space-y-2">
                             <label className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Libido</label>
                             <select className="w-full bg-white/5 border border-white/10 rounded-xl px-2 py-2 text-xs font-bold outline-none" value={formData.vitals.libido} onChange={(e) => setFormData({...formData, vitals: {...formData.vitals, libido: e.target.value}})}>
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Med</option>
                                <option value="HIGH">High</option>
                             </select>
                        </div>
                        <div className="space-y-2">
                             <label className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Mood</label>
                             <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl border border-white/10">
                                 <Smile size={14} className="text-green-400" />
                                 <input type="text" className="w-full bg-transparent outline-none text-xs" value={formData.vitals.mood} onChange={(e) => setFormData({...formData, vitals: {...formData.vitals, mood: e.target.value}})} placeholder="Happy..." />
                             </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-sm font-bold">Notes</label>
                        <textarea
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary min-h-[100px] text-sm"
                            placeholder="How are you feeling today?"
                            value={formData.notes}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full py-4 text-lg font-bold flex items-center justify-center gap-3"
                    >
                        {loading ? 'Saving...' : <><Save size={20} /> Save Cycle Data</>}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default MenstrualLogForm;
