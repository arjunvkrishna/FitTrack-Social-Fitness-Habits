import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: string;
    };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.header('X-User-ID');

    if (!userId) {
        return res.status(401).json({ message: 'No user ID, authorization denied' });
    }

    try {
        // In a "simple" auth, we just trust the ID passed or you could verify it exists in DB
        req.user = { id: userId, role: 'USER' }; // Default to USER role for simplicity
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
