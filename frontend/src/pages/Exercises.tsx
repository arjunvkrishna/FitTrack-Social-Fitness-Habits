import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity, Edit2, Trash2, Calendar } from 'lucide-react';
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
    Filler,
    RadarController,
    RadialLinearScale
} from 'chart.js';
import { Line, Radar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    RadarController,
    RadialLinearScale
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
    const [chartMetric, setChartMetric] = useState<'weight' | 'reps' | 'sets' | 'volume' | 'oneRM'>('weight');
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
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [workouts, selectedExerciseId]);

    const chartData = useMemo(() => {
        const metricLabels = {
            weight: 'Max Weight (kg)',
            reps: 'Total Reps',
            sets: 'Total Sets',
            volume: 'Total Volume (kg)',
            oneRM: 'Estimated 1RM (kg)'
        };

        const calculateMetricValue = (w: Workout) => {
            switch(chartMetric) {
                case 'volume': return (w.sets || 0) * (w.reps || 0) * (w.weight || 0);
                case 'oneRM': return (w.weight || 0) * (1 + (w.reps || 0) / 30);
                default: return w[chartMetric as keyof Workout] || 0;
            }
        };

        const colors = {
            weight: { border: '#EE2A7B', bg: 'rgba(238, 42, 123, 0.2)' },
            reps: { border: '#38EF7D', bg: 'rgba(56, 239, 125, 0.2)' },
            sets: { border: '#F9D423', bg: 'rgba(249, 212, 35, 0.2)' },
            volume: { border: '#00F2FE', bg: 'rgba(0, 242, 254, 0.2)' },
            oneRM: { border: '#8A2BE2', bg: 'rgba(138, 43, 226, 0.2)' }
        };
        
        return {
            labels: filteredWorkouts.map(w => format(new Date(w.date), 'MMM d')),
            datasets: [
                {
                    label: metricLabels[chartMetric],
                    data: filteredWorkouts.map(w => calculateMetricValue(w)),
                    borderColor: colors[chartMetric].border,
                    backgroundColor: colors[chartMetric].bg,
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

    const radarData = useMemo(() => {
        const muscleVolume: Record<string, number> = {};
        workouts.forEach(w => {
            const exercise = exercises.find(e => e._id === w.exerciseId);
            if (exercise) {
                const volume = (w.sets || 0) * (w.reps || 0) * (w.weight || 0);
                muscleVolume[exercise.targetMuscleGroup] = (muscleVolume[exercise.targetMuscleGroup] || 0) + volume;
            }
        });

        const labels = Object.keys(muscleVolume);
        const data = Object.values(muscleVolume);

        return {
            labels,
            datasets: [{
                label: 'Volume per Muscle Group',
                data,
                backgroundColor: 'rgba(56, 239, 125, 0.2)',
                borderColor: '#38EF7D',
                pointBackgroundColor: '#38EF7D',
                pointBorderColor: '#fff',
                fill: true
            }]
        };
    }, [workouts, exercises]);

    const radarOptions = {
        scales: {
            r: {
                angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                pointLabels: { color: 'rgba(255, 255, 255, 0.7)', font: { size: 12 } },
                ticks: { display: false }
            }
        },
        plugins: {
            legend: { display: false }
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div></div>;
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="max-w-6xl mx-auto space-y-6"
        >
            <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
                <h1 className="text-4xl font-bold gradient-text">Exercise Progress</h1>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div variants={itemVariants} className="lg:col-span-1 glass p-6 h-fit">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Activity className="text-primary" /> Select Exercise
                    </h2>
                    <select
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary mb-6 transition-all"
                        value={selectedExerciseId}
                        onChange={(e) => setSelectedExerciseId(e.target.value)}
                    >
                        {exercises.map(ex => (
                            <option key={ex._id} value={ex._id}>{ex.name} ({ex.category})</option>
                        ))}
                    </select>

                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 mt-8">
                        <Activity className="text-accent" /> Muscle Balance
                    </h2>
                    <div className="h-64 flex items-center justify-center">
                        {workouts.length > 0 ? (
                            <Radar data={radarData} options={radarOptions} />
                        ) : (
                            <p className="text-text-muted text-sm text-center">Log workouts to see your balance!</p>
                        )}
                    </div>
                </motion.div>

                <div className="lg:col-span-2 space-y-6">
                    {/* Graph */}
                    <motion.div variants={itemVariants} className="glass p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <h2 className="text-xl font-bold">Progress Chart</h2>
                            <div className="flex bg-white/5 p-1 rounded-full overflow-x-auto">
                                {(['weight', 'reps', 'sets', 'volume', 'oneRM'] as const).map((metric) => (
                                    <button
                                        key={metric}
                                        onClick={() => setChartMetric(metric)}
                                        className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all shrink-0 ${
                                            chartMetric === metric 
                                            ? 'bg-primary text-white shadow-lg' 
                                            : 'text-text-muted hover:text-white'
                                        }`}
                                    >
                                        {metric === 'oneRM' ? '1RM' : metric}
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
                    </motion.div>

                    {/* History */}
                    <motion.div variants={itemVariants} className="glass p-6">
                        <h2 className="text-xl font-bold mb-4">Past Workouts</h2>
                        <div className="space-y-4">
                            {(() => {
                                const list = [...filteredWorkouts].reverse();
                                const chronHistory = [...filteredWorkouts];
                                const prMap: Record<string, boolean> = {};
                                let runningMax = 0;
                                chronHistory.forEach(w => {
                                    const current1RM = (w.weight || 0) * (1 + (w.reps || 0) / 30);
                                    if (current1RM > runningMax) {
                                        prMap[w._id] = true;
                                        runningMax = current1RM;
                                    }
                                });

                                return list.map(workout => (
                                    <div key={workout._id} className={`bg-white/5 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 transition-colors hover:bg-white/10 ${prMap[workout._id] ? 'border-primary' : 'border-transparent'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-xl bg-white/5"><Calendar className="text-accent" size={20} /></div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-semibold">{format(new Date(workout.date), 'MMMM d, yyyy h:mm a')}</p>
                                                    {prMap[workout._id] && (
                                                        <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter shadow-sm">New PR!</span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-text-muted">
                                                    Sets: <span className="text-white font-bold">{workout.sets || 0}</span> | 
                                                    Reps: <span className="text-white font-bold">{workout.reps || 0}</span> | 
                                                    Weight: <span className="text-white font-bold">{workout.weight || 0}</span> kg |
                                                    <span className="text-primary ml-1">1RM: {Math.round((workout.weight || 0) * (1 + (workout.reps || 0) / 30))} kg</span>
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
                                ));
                            })()}
                        </div>
                    </motion.div>
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
