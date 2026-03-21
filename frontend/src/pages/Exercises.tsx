import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity, Edit2, Trash2, Plus, Calendar } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface Exercise {
    _id: string;
    name: string;
    category: string;
    targetMuscleGroup: string;
}

interface Workout {
    _id: string;
    userId: string;
    exerciseId: string;
    type: string;
    duration: number;
    sets: number;
    reps: number;
    weight: number;
    date: string;
}

const Exercises = () => {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
    const [chartMetric, setChartMetric] = useState<'weight' | 'reps' | 'sets'>('weight');
    const [loading, setLoading] = useState(true);

    const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
    const [editForm, setEditForm] = useState({ sets: 0, reps: 0, weight: 0 });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [exercisesRes, workoutsRes] = await Promise.all([
                    axios.get('/api/exercises'),
                    axios.get('/api/habits/workout')
                ]);
                setExercises(exercisesRes.data);
                setWorkouts(workoutsRes.data);
                if (exercisesRes.data.length > 0) {
                    setSelectedExerciseId(exercisesRes.data[0]._id);
                }
            } catch (err) {
                console.error('Error fetching exercise data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleEditWorkout = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingWorkout) return;
        try {
            await axios.put(`/api/habits/workout/${editingWorkout._id}`, editForm);
            const workoutsRes = await axios.get('/api/habits/workout');
            setWorkouts(workoutsRes.data);
            setEditingWorkout(null);
        } catch (err) {
            console.error('Error updating workout', err);
        }
    };

    const handleDeleteWorkout = async (id: string) => {
        if (!window.confirm('Delete this workout entry?')) return;
        try {
            await axios.delete(`/api/habits/workout/${id}`);
            const workoutsRes = await axios.get('/api/habits/workout');
            setWorkouts(workoutsRes.data);
        } catch (err) {
            console.error('Error deleting workout', err);
        }
    };

    const filteredWorkouts = useMemo(() => {
        return workouts
            .filter(w => w.exerciseId === selectedExerciseId)
            // Sort to oldest first for the chart (X-axis timeline)
            .sort((a: Workout, b: Workout) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [workouts, selectedExerciseId]);

    const chartData = useMemo(() => {
        const metricLabels = {
            weight: 'Weight (kg)',
            reps: 'Reps',
            sets: 'Sets'
        };
        
        return {
            labels: filteredWorkouts.map((w: Workout) => format(new Date(w.date), 'MMM d')),
            datasets: [
                {
                    label: metricLabels[chartMetric],
                    data: filteredWorkouts.map((w: Workout) => w[chartMetric] || 0),
                    borderColor: chartMetric === 'weight' ? '#EE2A7B' : chartMetric === 'reps' ? '#38EF7D' : '#F9D423',
                    backgroundColor: chartMetric === 'weight' ? 'rgba(238, 42, 123, 0.2)' : chartMetric === 'reps' ? 'rgba(56, 239, 125, 0.2)' : 'rgba(249, 212, 35, 0.2)',
                    fill: true,
                    tension: 0.4
                }
            ]
        };
    }, [filteredWorkouts, chartMetric]);

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' as const, labels: { color: 'rgba(255,255,255,0.7)' } },
            title: { display: false }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(255,255,255,0.1)' },
                ticks: { color: 'rgba(255,255,255,0.7)' }
            },
            x: {
                grid: { display: false },
                ticks: { color: 'rgba(255,255,255,0.7)' }
            }
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
                <h1 className="text-4xl font-bold gradient-text">Exercise Progress</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 glass p-6 h-fit">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Activity className="text-primary" /> Select Exercise
                    </h2>
                    <select
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary mb-6"
                        value={selectedExerciseId}
                        onChange={(e) => setSelectedExerciseId(e.target.value)}
                    >
                        {exercises.map(ex => (
                            <option key={ex._id} value={ex._id}>{ex.name} ({ex.category})</option>
                        ))}
                    </select>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    {/* Graph */}
                    <div className="glass p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <h2 className="text-xl font-bold">Progress Chart</h2>
                            <div className="flex bg-white/5 p-1 rounded-xl">
                                {(['weight', 'reps', 'sets'] as const).map((metric) => (
                                    <button
                                        key={metric}
                                        onClick={() => setChartMetric(metric)}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                                            chartMetric === metric 
                                            ? 'bg-primary text-white shadow-lg' 
                                            : 'text-text-muted hover:text-white'
                                        }`}
                                    >
                                        {metric}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {filteredWorkouts.length > 0 ? (
                            <div className="h-64">
                                <Line data={chartData} options={chartOptions} />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-text-muted">
                                <Activity size={48} className="opacity-20 mb-4" />
                                <p>No logs found for this exercise.</p>
                            </div>
                        )}
                    </div>

                    {/* History */}
                    <div className="glass p-6">
                        <h2 className="text-xl font-bold mb-4">Past Workouts</h2>
                        <div className="space-y-4">
                            {/* Display newest first for the list view */}
                            {[...filteredWorkouts].reverse().map(workout => (
                                <div key={workout._id} className="bg-white/5 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="text-accent" />
                                        <div>
                                            <p className="font-semibold">{format(new Date(workout.date), 'MMMM d, yyyy h:mm a')}</p>
                                            <p className="text-sm text-text-muted">
                                                Sets: <span className="text-white font-bold">{workout.sets || 0}</span> | 
                                                Reps: <span className="text-white font-bold">{workout.reps || 0}</span> | 
                                                Weight: <span className="text-white font-bold">{workout.weight || 0}</span> kg
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setEditingWorkout(workout);
                                                setEditForm({ sets: workout.sets || 0, reps: workout.reps || 0, weight: workout.weight || 0 });
                                            }}
                                            className="p-2 bg-white/5 hover:bg-primary/20 text-primary rounded-xl transition-colors"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteWorkout(workout._id)}
                                            className="p-2 bg-white/5 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {editingWorkout && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass w-full max-w-sm p-8 relative"
                    >
                        <h2 className="text-2xl font-bold mb-6">Edit Log</h2>
                        <form onSubmit={handleEditWorkout} className="space-y-4">
                            <div>
                                <label className="block text-sm text-text-muted mb-2">Sets</label>
                                <input
                                    type="number"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                                    value={editForm.sets}
                                    onChange={(e) => setEditForm({ ...editForm, sets: parseInt(e.target.value) || 0 })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-text-muted mb-2">Reps</label>
                                <input
                                    type="number"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                                    value={editForm.reps}
                                    onChange={(e) => setEditForm({ ...editForm, reps: parseInt(e.target.value) || 0 })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-text-muted mb-2">Weight (kg)</label>
                                <input
                                    type="number"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                                    value={editForm.weight}
                                    onChange={(e) => setEditForm({ ...editForm, weight: parseInt(e.target.value) || 0 })}
                                    required
                                />
                            </div>
                            <div className="flex gap-4 mt-8">
                                <button type="submit" className="flex-1 btn-primary">Save Changes</button>
                                <button
                                    type="button"
                                    onClick={() => setEditingWorkout(null)}
                                    className="flex-1 bg-surface-border hover:bg-white/10 transition-colors py-3 rounded-xl font-semibold"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
};

export default Exercises;
