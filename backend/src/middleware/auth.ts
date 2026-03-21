import { Request, Response, NextFunction } from 'express';
import User from '../models/User';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: string;
    };
    body: any; // Explicitly allowed for easier handling in controllers
    params: any;
    query: any;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.header('X-User-ID');

    if (!userId) {
        return res.status(401).json({ message: 'Authentication required: X-User-ID header missing' });
    }

    try {
        if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(401).json({ message: `Invalid user ID format: ${userId}` });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).json({ message: 'User not found in database' });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: 'Account is disabled' });
        }

        req.user = { id: userId, role: user.role };
        next();
    } catch (err) {
        res.status(401).json({ message: 'Authentication failed' });
    }
};

export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Access denied, admin only' });
    }
    next();
};
