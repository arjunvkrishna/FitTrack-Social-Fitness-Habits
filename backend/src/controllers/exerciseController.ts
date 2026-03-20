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

export const createExercise = async (req: Request, res: Response) => {
    try {
        const { name, category, targetMuscleGroup } = req.body;

        const existing = await Exercise.findOne({ name });
        if (existing) {
            return res.status(400).json({ message: 'Exercise already exists' });
        }

        const exercise = new Exercise({
            name,
            category,
            targetMuscleGroup
        });

        await exercise.save();
        logger.info(`Admin created new exercise: ${name}`);
        res.status(201).json(exercise);
    } catch (err: any) {
        logger.error('Error creating exercise:', err);
        res.status(500).json({ 
            message: err.message || 'Server error creating exercise',
            error: err
        });
    }
};

export const updateExercise = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const exercise = await Exercise.findByIdAndUpdate(id, updates, { new: true });
        if (!exercise) {
            return res.status(404).json({ message: 'Exercise not found' });
        }

        logger.info(`Admin updated exercise: ${exercise.name}`);
        res.json(exercise);
    } catch (err) {
        logger.error('Error updating exercise:', err);
        res.status(500).json({ message: 'Server error updating exercise' });
    }
};

export const deleteExercise = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const exercise = await Exercise.findByIdAndDelete(id);
        if (!exercise) {
            return res.status(404).json({ message: 'Exercise not found' });
        }

        logger.info(`Admin deleted exercise: ${exercise.name}`);
        res.json({ message: 'Exercise deleted successfully' });
    } catch (err) {
        logger.error('Error deleting exercise:', err);
        res.status(500).json({ message: 'Server error deleting exercise' });
    }
};
