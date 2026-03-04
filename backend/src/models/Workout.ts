import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkout extends Document {
    userId: mongoose.Types.ObjectId;
    exerciseId?: mongoose.Types.ObjectId;
    type: 'GYM' | 'RUNNING' | 'CUSTOM';
    activityName?: string;
    duration: number; // in minutes
    distance?: number; // in km
    caloriesBurned?: number;
    sets?: number;
    reps?: number;
    weight?: number;
    date: Date;
}

const WorkoutSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    exerciseId: { type: Schema.Types.ObjectId, ref: 'Exercise' },
    type: { type: String, enum: ['GYM', 'RUNNING', 'CUSTOM'], required: true },
    activityName: { type: String },
    duration: { type: Number, required: true },
    distance: { type: Number },
    caloriesBurned: { type: Number },
    sets: { type: Number },
    reps: { type: Number },
    weight: { type: Number },
    date: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model<IWorkout>('Workout', WorkoutSchema);
