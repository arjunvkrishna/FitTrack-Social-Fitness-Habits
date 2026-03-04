import { Request, Response } from 'express';
import Exercise from '../models/Exercise';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export const getExercises = async (req: Request, res: Response) => {
    try {
        const exercises = await Exercise.find().sort({ name: 1 });
        res.json(exercises);
    } catch (err) {
        logger.error('Error fetching exercises:', err);
        res.status(500).json({ message: 'Server error fetching exercises' });
    }
};

export const createExercise = async (req: AuthRequest, res: Response) => {
    try {
        // Simple role check (assumes role is on req.user)
        if (req.user?.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const { name, category, instructions, targetMuscleGroup } = req.body;

        const existing = await Exercise.findOne({ name });
        if (existing) {
            return res.status(400).json({ message: 'Exercise already exists' });
        }

        const exercise = new Exercise({
            name,
            category,
            instructions,
            targetMuscleGroup
        });

        await exercise.save();
        logger.info(`Admin created new exercise: ${name}`);
        res.status(201).json(exercise);
    } catch (err) {
        logger.error('Error creating exercise:', err);
        res.status(500).json({ message: 'Server error creating exercise' });
    }
};
