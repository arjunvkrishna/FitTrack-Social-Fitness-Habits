import mongoose, { Schema, Document } from 'mongoose';

export interface IWaterIntake extends Document {
    userId: mongoose.Types.ObjectId;
    amount: number; // in ml
    date: Date;
}

const WaterIntakeSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model<IWaterIntake>('WaterIntake', WaterIntakeSchema);
