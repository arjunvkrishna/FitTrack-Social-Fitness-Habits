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
        const history = await WaterIntake.find({ userId }).sort({ date: -1 }).limit(30);
        res.json(history);
    } catch (err) {
        res.status(500).json({ message: 'Server error fetching history' });
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
