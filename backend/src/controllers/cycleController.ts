import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import MenstrualCycle from '../models/MenstrualCycle';
import { addDays, format } from 'date-fns';

export const logCycle = async (req: AuthRequest, res: Response) => {
    try {
        const { startDate, endDate, cycleLength, periodDuration, symptoms, notes } = req.body;
        const userId = req.user?.id;

        const cycle = new MenstrualCycle({
            userId,
            startDate,
            endDate,
            cycleLength,
            periodDuration,
            symptoms,
            notes,
        });

        await cycle.save();
        res.status(201).json(cycle);
    } catch (err) {
        res.status(500).json({ message: 'Server error logging cycle' });
    }
};

export const getCyclePredictions = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const latestCycle = await MenstrualCycle.findOne({ userId }).sort({ startDate: -1 });

        if (!latestCycle) {
            return res.status(404).json({ message: 'No cycle data found' });
        }

        const nextCycleDate = addDays(new Date(latestCycle.startDate), latestCycle.cycleLength || 28);

        res.json({
            latestCycle,
            predictedNextDate: nextCycleDate,
            daysUntilNext: Math.ceil((nextCycleDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error calculating predictions' });
    }
};

export const getCycleHistory = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const history = await MenstrualCycle.find({ userId }).sort({ startDate: -1 });
        res.json(history);
    } catch (err) {
        res.status(500).json({ message: 'Server error fetching history' });
    }
};
