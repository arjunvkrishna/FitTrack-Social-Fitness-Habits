import mongoose, { Schema, Document } from 'mongoose';

export interface IMenstrualLog extends Document {
    userId: mongoose.Types.ObjectId;
    date: Date;
    
    // Physiological Signals
    bbt?: number; // Basal Body Temperature
    bbtFlags?: ('ILLNESS' | 'ALCOHOL' | 'POOR_SLEEP')[];
    
    cervicalMucus?: 'NONE' | 'STICKY' | 'CREAMY' | 'WATERY' | 'EGG_WHITE';
    opkResult?: 'NEGATIVE' | 'POSITIVE' | 'PEAK';
    
    // Structured Symptoms
    symptoms: {
        cramping?: 'NONE' | 'MILD' | 'MODERATE' | 'SEVERE';
        bloating?: boolean;
        breastTenderness?: boolean;
        headache?: boolean;
        acne?: boolean;
        nausea?: boolean;
        spotting?: boolean;
    };
    
    // Vitals & Mood
    vitals: {
        energyLevel?: number; // 1-5
        mood?: string;
        libido?: 'LOW' | 'MEDIUM' | 'HIGH';
        stress?: number; // 1-5
        sleepQuality?: number; // 1-5
    };
    
    notes?: string;
}

const MenstrualLogSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    
    bbt: { type: Number },
    bbtFlags: [{ type: String, enum: ['ILLNESS', 'ALCOHOL', 'POOR_SLEEP'] }],
    
    cervicalMucus: { type: String, enum: ['NONE', 'STICKY', 'CREAMY', 'WATERY', 'EGG_WHITE'] },
    opkResult: { type: String, enum: ['NEGATIVE', 'POSITIVE', 'PEAK'] },
    
    symptoms: {
        cramping: { type: String, enum: ['NONE', 'MILD', 'MODERATE', 'SEVERE'], default: 'NONE' },
        bloating: { type: Boolean, default: false },
        breastTenderness: { type: Boolean, default: false },
        headache: { type: Boolean, default: false },
        acne: { type: Boolean, default: false },
        nausea: { type: Boolean, default: false },
        spotting: { type: Boolean, default: false },
    },
    
    vitals: {
        energyLevel: { type: Number, min: 1, max: 5 },
        mood: { type: String },
        libido: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'] },
        stress: { type: Number, min: 1, max: 5 },
        sleepQuality: { type: Number, min: 1, max: 5 },
    },
    
    notes: { type: String },
}, { timestamps: true });

// Ensure unique log per user per day
MenstrualLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model<IMenstrualLog>('MenstrualLog', MenstrualLogSchema);
