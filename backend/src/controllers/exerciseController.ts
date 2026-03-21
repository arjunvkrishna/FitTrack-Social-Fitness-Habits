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
        logger.error('Error creating exercise:', { error: err.message, stack: err.stack, body: req.body });
        res.status(500).json({ 
            message: err.message || 'Server error creating exercise',
            error: process.env.NODE_ENV === 'development' ? err : undefined
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

export const exportExercises = async (req: Request, res: Response) => {
    try {
        const exercises = await Exercise.find().sort({ name: 1 });
        let csv = 'Name,Category,Target Muscle Group\n';
        
        exercises.forEach((ex: any) => {
            // Escape commas in names if any
            const name = ex.name.includes(',') ? `"${ex.name}"` : ex.name;
            const muscle = (ex.targetMuscleGroup || '').includes(',') ? `"${ex.targetMuscleGroup}"` : (ex.targetMuscleGroup || '');
            csv += `${name},${ex.category},${muscle}\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=exercises.csv');
        res.status(200).send(csv);
    } catch (err) {
        logger.error('Error exporting exercises:', err);
        res.status(500).json({ message: 'Server error exporting exercises' });
    }
};

export const importExercises = async (req: Request, res: Response) => {
    try {
        const csvData = req.body;
        if (!csvData || typeof csvData !== 'string') {
            return res.status(400).json({ message: 'No CSV data provided' });
        }

        const lines = csvData.split(/\r?\n/);
        const results = { created: 0, updated: 0, errors: 0 };
        const validCategories = ['STRENGTH', 'CARDIO', 'FLEXIBILITY', 'OTHER'];

        // Skip header
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Simple CSV split (not handling escaped commas for now, but good enough for common use)
            // A more robust regex for CSV split: /,(?=(?:(?:[^"]*"){2})*[^"]*$)/
            const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(p => p.trim().replace(/^"|"$/g, ''));
            
            if (parts.length < 2) {
                results.errors++;
                continue;
            }

            const [name, category, targetMuscleGroup] = parts;
            const upperCategory = category.toUpperCase();

            if (!validCategories.includes(upperCategory)) {
                results.errors++;
                continue;
            }

            try {
                const existing = await Exercise.findOne({ name });
                if (existing) {
                    existing.category = upperCategory as any;
                    existing.targetMuscleGroup = targetMuscleGroup || existing.targetMuscleGroup;
                    await existing.save();
                    results.updated++;
                } else {
                    const exercise = new Exercise({
                        name,
                        category: upperCategory,
                        targetMuscleGroup
                    });
                    await exercise.save();
                    results.created++;
                }
            } catch (err) {
                results.errors++;
            }
        }

        res.json({ 
            message: `Import complete. Created: ${results.created}, Updated: ${results.updated}, Errors: ${results.errors}`,
            results 
        });
    } catch (err) {
        logger.error('Error importing exercises:', err);
        res.status(500).json({ message: 'Server error importing exercises' });
    }
};
