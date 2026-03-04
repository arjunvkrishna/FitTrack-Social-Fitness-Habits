import { Request, Response, NextFunction } from 'express';
import User from '../models/User';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: string;
    };
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.header('X-User-ID');

    if (!userId) {
        return res.status(401).json({ message: 'No user ID, authorization denied' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        req.user = { id: userId, role: user.role };
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid user ID' });
    }
};

export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Access denied, admin only' });
    }
    next();
};
