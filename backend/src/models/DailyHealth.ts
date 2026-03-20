import mongoose, { Schema, Document } from 'mongoose';

export interface IFoodItem {
    name: string;
    calories: number;
    protein?: number;
    carbs?: number;
    fats?: number;
}

export interface IDailyHealth extends Document {
    userId: mongoose.Types.ObjectId;
    dateStr: string; // YYYY-MM-DD in GST timezone
    steps: number;
    sleepHours: number;
    foods: IFoodItem[];
}

const FoodItemSchema = new Schema({
    name: { type: String, required: true },
    calories: { type: Number, required: true },
    protein: { type: Number },
    carbs: { type: Number },
    fats: { type: Number }
});

const DailyHealthSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    dateStr: { type: String, required: true },
    steps: { type: Number, default: 0 },
    sleepHours: { type: Number, default: 0 },
    foods: [FoodItemSchema]
}, { timestamps: true });

// Ensure one daily health record per user per day
DailyHealthSchema.index({ userId: 1, dateStr: 1 }, { unique: true });

export default mongoose.model<IDailyHealth>('DailyHealth', DailyHealthSchema);
