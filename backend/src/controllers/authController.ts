import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { logger } from '../utils/logger';

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password, gender, username } = req.body;

        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const usernameExists = await User.findOne({ username });
        if (usernameExists) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            username: username || email.split('@')[0], // Fallback to email prefix if not provided
            email,
            passwordHash,
            gender,
        });

        await newUser.save();

        const token = jwt.sign(
            { id: newUser._id, role: newUser.role },
            process.env.JWT_SECRET || 'your_super_secret_key_change_me_in_production',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            user: {
                id: newUser._id,
                name: newUser.name,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
                gender: newUser.gender,
            },
        });
    } catch (err: any) {
        logger.error('Registration error:', err);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        res.json({
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role,
                gender: user.gender,
            },
        });
    } catch (err: any) {
        logger.error('Login error:', err);
        res.status(500).json({ message: 'Server error during login' });
    }
};
export const checkSetupRequired = async (req: Request, res: Response) => {
    try {
        const userCount = await User.countDocuments();
        res.json({ setupRequired: userCount === 0 });
    } catch (err) {
        res.status(500).json({ message: 'Error checking setup status' });
    }
};

export const setupAdmin = async (req: Request, res: Response) => {
    try {
        const userCount = await User.countDocuments();
        if (userCount > 0) {
            return res.status(400).json({ message: 'System already setup' });
        }

        const { name, email, password, username } = req.body;

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const admin = new User({
            name,
            username: username || 'admin',
            email,
            passwordHash,
            role: 'ADMIN',
            gender: 'OTHER'
        });

        await admin.save();
        logger.info(`Admin setup complete for email: ${email}`);

        res.status(201).json({
            message: 'Admin setup successful',
            user: {
                id: admin._id,
                name: admin.name,
                username: admin.username,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (err: any) {
        logger.error('Admin setup error:', err);
        res.status(500).json({ message: 'Error during admin setup' });
    }
};
