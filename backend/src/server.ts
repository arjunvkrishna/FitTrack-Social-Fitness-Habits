import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes';
import { logger } from './utils/logger';
import habitRoutes from './routes/habitRoutes';
import cycleRoutes from './routes/cycleRoutes';
import socialRoutes from './routes/socialRoutes';
import exerciseRoutes from './routes/exerciseRoutes';
import bucketListRoutes from './routes/bucketListRoutes';
import userRoutes from './routes/userRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    logger.trace(`${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/cycle', cycleRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/bucketlist', bucketListRoutes);
app.use('/api/users', userRoutes);

import User from './models/User';
import bcrypt from 'bcryptjs';

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fittrack';
mongoose.connect(MONGODB_URI)
    .then(() => {
        logger.info('Connected to MongoDB');
    })
    .catch((err) => logger.error('MongoDB connection error:', err));

// Basic Route
app.get('/', (req, res) => {
    res.send('FitTrack API is running...');
});

// Start Server
app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});

export default app;
