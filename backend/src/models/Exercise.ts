import mongoose, { Schema, Document } from 'mongoose';

export interface IExercise extends Document {
    name: string;
    category: 'STRENGTH' | 'CARDIO' | 'FLEXIBILITY' | 'OTHER';
    instructions?: string;
    targetMuscleGroup?: string;
}

const ExerciseSchema: Schema = new Schema({
    name: { type: String, required: true, unique: true },
    category: {
        type: String,
        enum: ['STRENGTH', 'CARDIO', 'FLEXIBILITY', 'OTHER'],
        required: true,
        default: 'STRENGTH'
    },
    instructions: { type: String },
    targetMuscleGroup: { type: String },
}, { timestamps: true });

export default mongoose.model<IExercise>('Exercise', ExerciseSchema);
