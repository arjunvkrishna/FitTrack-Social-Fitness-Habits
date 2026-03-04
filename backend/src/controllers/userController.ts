import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
        const { name, username, gender, privacySettings } = req.body;
        const userId = req.user?.id;

        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        // Check if username is taken by another user
        if (username) {
            const existingUser = await User.findOne({ username, _id: { $ne: userId } });
            if (existingUser) {
                return res.status(400).json({ message: 'Username already taken' });
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    name,
                    username,
                    gender,
                    privacySettings: privacySettings
                }
            },
            { new: true }
        ).select('-passwordHash');

        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ message: 'Error updating profile' });
    }
};

export const updatePassword = async (req: AuthRequest, res: Response) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user?.id;

        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password incorrect' });
        }

        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error updating password' });
    }
};

export const updateProfilePicture = async (req: AuthRequest, res: Response) => {
    try {
        const { profilePicture } = req.body; // Expecting a URL or base64
        const userId = req.user?.id;

        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: { profilePicture } },
            { new: true }
        ).select('-passwordHash');

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Error updating profile picture' });
    }
};

export const searchUsers = async (req: Request, res: Response) => {
    try {
        const { query } = req.query;
        if (!query || typeof query !== 'string') {
            return res.status(400).json({ message: 'Query parameter required' });
        }

        const users = await User.find({
            $or: [
                { username: { $regex: query, $options: 'i' } },
                { name: { $regex: query, $options: 'i' } }
            ]
        })
            .select('name username profilePicture privacySettings')
            .limit(10);

        // Filter results based on privacy settings (e.g., if showProfilePicture is PRIVATE, hide it)
        const sanitizedUsers = users.map(user => {
            const userObj = user.toObject() as any;
            if (user.privacySettings?.showProfilePicture === 'PRIVATE') {
                delete userObj.profilePicture;
            }
            return userObj;
        });

        res.json(sanitizedUsers);
    } catch (err) {
        res.status(500).json({ message: 'Error searching users' });
    }
};

export const getProfile = async (req: Request, res: Response) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username }).select('-passwordHash -email');

        if (!user) return res.status(404).json({ message: 'User not found' });

        const userObj = user.toObject() as any;
        // Privacy checks (this would ideally be more robust, checking if friends etc.)
        if (user.privacySettings?.showProfilePicture === 'PRIVATE') {
            delete userObj.profilePicture;
        }
        if (user.privacySettings?.showAchievements === 'PRIVATE') {
            delete userObj.points;
        }

        res.json(userObj);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching profile' });
    }
};

// Admin Endpoints
export const getAllUsers = async (req: AuthRequest, res: Response) => {
    try {
        const users = await User.find().select('-passwordHash');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching users' });
    }
};

export const updateUserStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { userId, isActive } = req.body;
        const user = await User.findByIdAndUpdate(userId, { isActive }, { new: true }).select('-passwordHash');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Error updating user status' });
    }
};

export const adminResetPassword = async (req: AuthRequest, res: Response) => {
    try {
        const { userId, newPassword } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: 'User password reset successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error resetting user password' });
    }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req.params;
        const user = await User.findByIdAndDelete(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting user' });
    }
};
