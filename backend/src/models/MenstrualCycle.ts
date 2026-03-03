import mongoose, { Schema, Document } from 'mongoose';

export interface IMenstrualCycle extends Document {
    userId: mongoose.Types.ObjectId;
    startDate: Date;
    endDate?: Date;
    cycleLength: number; // average duration in days
    periodDuration: number; // average duration in days
    symptoms: string[];
    notes?: string;
}

const MenstrualCycleSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    cycleLength: { type: Number, default: 28 },
    periodDuration: { type: Number, default: 5 },
    symptoms: [{ type: String }],
    notes: { type: String },
}, { timestamps: true });

export default mongoose.model<IMenstrualCycle>('MenstrualCycle', MenstrualCycleSchema);
