import mongoose, { Schema, Document } from 'mongoose';

export interface ITemplateExercise {
    exerciseId: mongoose.Types.ObjectId;
    targetSets: number;
    targetReps: number;
    targetWeight: number;
    weightUnit: 'kg' | 'lbs';
    notes?: string;
}

export interface IWorkoutTemplate extends Document {
    userId: mongoose.Types.ObjectId;
    name: string;
    exercises: ITemplateExercise[];
    createdAt: Date;
    updatedAt: Date;
}

const WorkoutTemplateSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    exercises: [{
        exerciseId: { type: Schema.Types.ObjectId, ref: 'Exercise', required: true },
        targetSets: { type: Number, default: 3 },
        targetReps: { type: Number, default: 10 },
        targetWeight: { type: Number, default: 0 },
        weightUnit: { type: String, enum: ['kg', 'lbs'], default: 'kg' },
        notes: { type: String }
    }]
}, { timestamps: true });

export default mongoose.model<IWorkoutTemplate>('WorkoutTemplate', WorkoutTemplateSchema);
