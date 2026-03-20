import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import WaterIntake from '../models/WaterIntake';
import Workout from '../models/Workout';
import User from '../models/User';

export const addWaterIntake = async (req: AuthRequest, res: Response) => {
    try {
        const { amount } = req.body;
        const userId = req.user?.id;

        const intake = new WaterIntake({
            userId,
            amount,
        });

        await intake.save();

        // Logic to update user points and streaks could go here
        const user = await User.findById(userId);
        if (user) {
            user.points += 10; // Basic point for logging
            await user.save();
        }

        res.status(201).json(intake);
    } catch (err) {
        res.status(500).json({ message: 'Server error adding water intake' });
    }
};

export const getWaterHistory = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        // 1. Get today's detailed logs
        // GST timezone calculation (same as healthController)
        const date = new Date();
        const options = { timeZone: 'Asia/Dubai', year: 'numeric', month: '2-digit', day: '2-digit' } as const;
        const parts = new Intl.DateTimeFormat('en-CA', options).formatToParts(date);
        const year = parts.find(p => p.type === 'year')?.value || '1970';
        const month = parts.find(p => p.type === 'month')?.value || '01';
        const day = parts.find(p => p.type === 'day')?.value || '01';

        const todayStartGST = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), -4, 0, 0, 0));
        const tomorrowStartGST = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day) + 1, -4, 0, 0, 0));

        const todayLogs = await WaterIntake.find({
            userId,
            date: { $gte: todayStartGST, $lt: tomorrowStartGST }
        }).sort({ date: -1 });

        // 2. Get past 30 days grouped
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const historyAgg = await WaterIntake.aggregate([
            { $match: { userId: userId, date: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date", timezone: "Asia/Dubai" } },
                    total: { $sum: "$amount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({ todayLogs, history: historyAgg });
    } catch (err) {
        res.status(500).json({ message: 'Server error fetching history' });
    }
};

export const editWaterIntake = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { amount } = req.body;
        const intake = await WaterIntake.findOneAndUpdate(
            { _id: id, userId: req.user?.id },
            { amount },
            { new: true }
        );
        if (!intake) return res.status(404).json({ message: 'Not found' });
        res.json(intake);
    } catch (err) {
        res.status(500).json({ message: 'Server error editing water' });
    }
};

export const deleteWaterIntake = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const intake = await WaterIntake.findOneAndDelete({ _id: id, userId: req.user?.id });
        if (!intake) return res.status(404).json({ message: 'Not found' });
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error deleting water' });
    }
};

export const logWorkout = async (req: AuthRequest, res: Response) => {
    try {
        const { type, activityName, duration, distance, caloriesBurned, exerciseId, sets, reps, weight } = req.body;
        const userId = req.user?.id;

        const workout = new Workout({
            userId,
            exerciseId,
            type,
            activityName,
            duration,
            distance,
            caloriesBurned,
            sets,
            reps,
            weight
        });

        await workout.save();

        const user = await User.findById(userId);
        if (user) {
            user.points += 20; // Workouts worth more
            await user.save();
        }

        res.status(201).json(workout);
    } catch (err) {
        res.status(500).json({ message: 'Server error logging workout' });
    }
};

export const getWorkoutHistory = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const history = await Workout.find({ userId }).sort({ date: -1 }).limit(30);
        res.json(history);
    } catch (err) {
        res.status(500).json({ message: 'Server error fetching workouts' });
    }
};

export const editWorkout = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const { sets, reps, weight } = req.body;
        
        const workout = await Workout.findOneAndUpdate(
            { _id: id, userId },
            { $set: { sets, reps, weight } },
            { new: true }
        );
        
        if (!workout) {
            return res.status(404).json({ message: 'Workout not found or unauthorized' });
        }
        res.json(workout);
    } catch (err) {
        res.status(500).json({ message: 'Server error editing workout' });
    }
};

export const deleteWorkout = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        
        const workout = await Workout.findOneAndDelete({ _id: id, userId });
        if (!workout) {
            return res.status(404).json({ message: 'Workout not found or unauthorized' });
        }
        res.json({ message: 'Workout deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error deleting workout' });
    }
};

export const resetUserStats = async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req.body;
        const user = await User.findByIdAndUpdate(userId, {
            $set: {
                points: 0,
                'streaks.water': 0,
                'streaks.workout': 0,
                'streaks.running': 0,
                'streaks.overall': 0
            }
        }, { new: true });

        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User stats reset successfully', user });
    } catch (err) {
        res.status(500).json({ message: 'Error resetting user stats' });
    }
};
