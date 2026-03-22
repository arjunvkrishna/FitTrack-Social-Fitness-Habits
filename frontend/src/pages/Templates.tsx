import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Trash2, Edit2, Play, Activity, Target, Save, X } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Exercise {
    _id: string;
    name: string;
    category: string;
    defaultRestTime?: number;
}

interface TemplateExercise {
    exerciseId: string;
    name: string;
    targetSets: number;
    targetReps: number;
    targetWeight: number;
}

interface WorkoutTemplate {
    _id: string;
    name: string;
    exercises: TemplateExercise[];
}

const Templates = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        exercises: [] as TemplateExercise[]
    });

    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchTemplates();
        fetchExercises();
    }, []);

    const fetchTemplates = async () => {
        try {
            const res = await axios.get('/api/workout-templates');
            setTemplates(res.data);
        } catch (err) {
            console.error('Error fetching templates', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchExercises = async () => {
        try {
            const res = await axios.get('/api/exercises');
            setExercises(res.data);
        } catch (err) {
            console.error('Error fetching exercises', err);
        }
    };

    const handleSaveTemplate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.exercises.length === 0) {
            alert('Please add at least one exercise to the template.');
            return;
        }

        try {
            if (editingTemplate) {
                await axios.put(`/api/workflow-templates/${editingTemplate._id}`, formData);
            } else {
                await axios.post('/api/workflow-templates', formData);
            }
            setShowModal(false);
            setEditingTemplate(null);
            setFormData({ name: '', exercises: [] });
            fetchTemplates();
        } catch (err) {
            console.error('Error saving template', err);
            alert('Failed to save template.');
        }
    };

    const handleDeleteTemplate = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this template?')) return;
        try {
            await axios.delete(`/api/workflow-templates/${id}`);
            fetchTemplates();
        } catch (err) {
            console.error('Error deleting template', err);
            alert('Failed to delete template.');
        }
    };

    const addExerciseToTemplate = (exercise: Exercise) => {
        const newEx: TemplateExercise = {
            exerciseId: exercise._id,
            name: exercise.name,
            targetSets: 3,
            targetReps: 10,
            targetWeight: 0
        };
        setFormData(prev => ({
            ...prev,
            exercises: [...prev.exercises, newEx]
        }));
    };

    const removeExerciseFromTemplate = (index: number) => {
        setFormData(prev => ({
            ...prev,
            exercises: prev.exercises.filter((_, i) => i !== index)
        }));
    };

    const updateExerciseTarget = (index: number, field: keyof TemplateExercise, value: number) => {
        setFormData(prev => {
            const newExercises = [...prev.exercises];
            (newExercises[index] as any)[field] = value;
            return { ...prev, exercises: newExercises };
        });
    };

    const filteredTemplates = templates.filter(t => 
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-6xl mx-auto space-y-6"
        >
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-4xl font-bold gradient-text">Workout Templates</h1>
                <button
                    onClick={() => {
                        setEditingTemplate(null);
                        setFormData({ name: '', exercises: [] });
                        setShowModal(true);
                    }}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={20} /> Create Template
                </button>
            </div>

            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                <input
                    type="text"
                    placeholder="Search templates..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 outline-none focus:ring-2 focus:ring-primary text-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map(template => (
                    <motion.div
                        key={template._id}
                        layoutId={template._id}
                        className="glass p-6 group hover:border-primary transition-all flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold">{template.name}</h3>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => {
                                            setEditingTemplate(template);
                                            setFormData({
                                                name: template.name,
                                                exercises: [...template.exercises]
                                            });
                                            setShowModal(true);
                                        }}
                                        className="p-2 bg-white/5 hover:bg-primary/20 text-primary rounded-lg transition-colors"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteTemplate(template._id)}
                                        className="p-2 bg-white/5 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2 mb-6">
                                {template.exercises.map((ex, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-sm text-text-muted">
                                        <Activity size={14} className="text-accent" />
                                        <span>{ex.name}: {ex.targetSets} sets × {ex.targetReps} reps</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                navigate(`/active-workout/${template._id}`);
                            }}
                            className="w-full py-3 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-white transition-all font-bold flex items-center justify-center gap-2"
                        >
                            <Play size={18} /> Start Workout
                        </button>
                    </motion.div>
                ))}
                {filteredTemplates.length === 0 && (
                    <div className="col-span-full py-12 text-center text-text-muted glass">
                        No templates found. Create your first one to speed up your workouts!
                    </div>
                )}
            </div>

            {/* Template Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
                    >
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <h2 className="text-2xl font-bold">{editingTemplate ? 'Edit Template' : 'Create Template'}</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-lg">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-8">
                            {/* Form Side */}
                            <div className="flex-1 space-y-6">
                                <div>
                                    <label className="block text-sm text-text-muted mb-2">Template Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Upper Body Strength"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary text-lg"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-sm text-text-muted font-bold uppercase tracking-wider">Exercises</label>
                                    {formData.exercises.length === 0 ? (
                                        <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-2xl text-text-muted">
                                            Select exercises from the list to add them
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {formData.exercises.map((ex, idx) => (
                                                <div key={idx} className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-bold flex items-center gap-2">
                                                            <Activity className="text-primary" size={18} />
                                                            {ex.name}
                                                        </span>
                                                        <button onClick={() => removeExerciseFromTemplate(idx)} className="text-red-400 hover:text-red-300">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-4">
                                                        <div>
                                                            <label className="text-[10px] text-text-muted uppercase font-bold mb-1 block">Sets</label>
                                                            <input
                                                                type="number"
                                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm"
                                                                value={ex.targetSets}
                                                                onChange={(e) => updateExerciseTarget(idx, 'targetSets', parseInt(e.target.value) || 0)}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] text-text-muted uppercase font-bold mb-1 block">Reps</label>
                                                            <input
                                                                type="number"
                                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm"
                                                                value={ex.targetReps}
                                                                onChange={(e) => updateExerciseTarget(idx, 'targetReps', parseInt(e.target.value) || 0)}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] text-text-muted uppercase font-bold mb-1 block">Weight (kg)</label>
                                                            <input
                                                                type="number"
                                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm"
                                                                value={ex.targetWeight}
                                                                onChange={(e) => updateExerciseTarget(idx, 'targetWeight', parseInt(e.target.value) || 0)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Selector Side */}
                            <div className="lg:w-80 flex flex-col">
                                <label className="block text-sm text-text-muted mb-4 font-bold uppercase tracking-wider">Add Exercises</label>
                                <div className="relative mb-4">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Filter exercises..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm"
                                        onChange={(e) => {
                                            const val = e.target.value.toLowerCase();
                                            // Handle local filtering
                                        }}
                                    />
                                </div>
                                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                    {exercises.map(ex => (
                                        <button
                                            key={ex._id}
                                            type="button"
                                            onClick={() => addExerciseToTemplate(ex)}
                                            className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-primary/10 transition-colors border border-transparent hover:border-primary/30 group"
                                        >
                                            <div className="font-bold text-sm group-hover:text-primary transition-colors">{ex.name}</div>
                                            <div className="text-[10px] text-text-muted">{ex.category}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/10 flex gap-4">
                            <button
                                onClick={handleSaveTemplate}
                                className="flex-1 btn-primary py-4 flex items-center justify-center gap-2"
                            >
                                <Save size={20} />
                                {editingTemplate ? 'Update Template' : 'Create Template'}
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors font-bold"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
};

export default Templates;
