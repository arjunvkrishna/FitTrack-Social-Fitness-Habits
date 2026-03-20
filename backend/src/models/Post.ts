import mongoose, { Schema, Document } from 'mongoose';

export interface IPost extends Document {
    userId: mongoose.Types.ObjectId;
    content: string;
    workoutId?: mongoose.Types.ObjectId;
    likes: mongoose.Types.ObjectId[];
    comments: {
        userId: mongoose.Types.ObjectId;
        text: string;
        createdAt: Date;
    }[];
}

const PostSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    workoutId: { type: Schema.Types.ObjectId, ref: 'Workout' },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    comments: [{
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

export default mongoose.model<IPost>('Post', PostSchema);
