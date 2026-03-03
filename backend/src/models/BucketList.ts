import mongoose, { Schema, Document } from 'mongoose';

export interface IBucketList extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    category: 'FITNESS' | 'TRAVEL' | 'HABIT' | 'CUSTOM';
    isShared: boolean;
    sharedWith: mongoose.Types.ObjectId[];
    isCompleted: boolean;
    deadline?: Date;
    tasks: {
        taskName: string;
        isDone: boolean;
    }[];
}

const BucketListSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    category: { type: String, enum: ['FITNESS', 'TRAVEL', 'HABIT', 'CUSTOM'], default: 'CUSTOM' },
    isShared: { type: String, default: false },
    sharedWith: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    isCompleted: { type: Boolean, default: false },
    deadline: { type: Date },
    tasks: [{
        taskName: { type: String, required: true },
        isDone: { type: Boolean, default: false }
    }],
}, { timestamps: true });

export default mongoose.model<IBucketList>('BucketList', BucketListSchema);
