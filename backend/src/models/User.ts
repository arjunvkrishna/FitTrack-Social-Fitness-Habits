import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    name: string;
    username: string;
    email: string;
    passwordHash: string;
    role: 'USER' | 'ADMIN';
    avatar?: string;
    profilePicture?: string;
    points: number;
    friends: mongoose.Types.ObjectId[];
    waterGoal: number; // in ml
    streaks: {
        water: number;
        workout: number;
        running: number;
        overall: number;
    };
    privacySettings: {
        showProfilePicture: 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
        showAchievements: 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
        showStats: 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
    };
    lastActive: Date;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
}

const UserSchema: Schema = new Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
    avatar: { type: String },
    profilePicture: { type: String },
    points: { type: Number, default: 0 },
    friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    waterGoal: { type: Number, default: 2000 },
    streaks: {
        water: { type: Number, default: 0 },
        workout: { type: Number, default: 0 },
        running: { type: Number, default: 0 },
        overall: { type: Number, default: 0 },
    },
    privacySettings: {
        showProfilePicture: { type: String, enum: ['PUBLIC', 'FRIENDS', 'PRIVATE'], default: 'PUBLIC' },
        showAchievements: { type: String, enum: ['PUBLIC', 'FRIENDS', 'PRIVATE'], default: 'PUBLIC' },
        showStats: { type: String, enum: ['PUBLIC', 'FRIENDS', 'PRIVATE'], default: 'PUBLIC' },
    },
    lastActive: { type: Date, default: Date.now },
    gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'] },
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
