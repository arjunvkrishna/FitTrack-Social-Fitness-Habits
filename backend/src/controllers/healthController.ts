import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import DailyHealth from '../models/DailyHealth';
import WaterIntake from '../models/WaterIntake';
import Workout from '../models/Workout';

// Helper to get today's date string in GST (UTC+4)
export const getGSTDateString = (dateInput?: string): string => {
    const date = dateInput ? new Date(dateInput) : new Date();
    const options = { timeZone: 'Asia/Dubai', year: 'numeric', month: '2-digit', day: '2-digit' } as const;
    const parts = new Intl.DateTimeFormat('en-CA', options).formatToParts(date); // en-CA gives YYYY-MM-DD
    const year = parts.find(p => p.type === 'year')?.value || '1970';
    const month = parts.find(p => p.type === 'month')?.value || '01';
    const day = parts.find(p => p.type === 'day')?.value || '01';
    return `${year}-${month}-${day}`;
};

import User from '../models/User';

export const getDailySummary = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const dateStr = getGSTDateString();

        const userObj = await User.findById(userId);

        // Find or create DailyHealth for today
        let dailyHealth = await DailyHealth.findOne({ userId, dateStr });
        if (!dailyHealth) {
            dailyHealth = await DailyHealth.create({ userId, dateStr });
        }

        // Get today's water
        // The dates for Water and Workouts are stored in UTC. We need to fetch any records created during "today" in GST.
        // GST is UTC+4. 00:00 GST -> 20:00 UTC (prev day). 23:59:59 GST -> 19:59:59 UTC (current day).
        const [year, month, day] = dateStr.split('-');
        const todayStartGST = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), -4, 0, 0, 0));
        const tomorrowStartGST = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day) + 1, -4, 0, 0, 0));

        const waterLogs = await WaterIntake.find({
            userId,
            date: { $gte: todayStartGST, $lt: tomorrowStartGST }
        });
        const totalWater = waterLogs.reduce((sum, w) => sum + w.amount, 0);

        const workoutLogs = await Workout.find({
            userId,
            date: { $gte: todayStartGST, $lt: tomorrowStartGST }
        });

        // Calculate BMR (Mifflin-St Jeor)
        let bmr = 0;
        if (userObj) {
            const weight = userObj.weight || 70; // Default 70kg
            const height = userObj.height || 170; // Default 170cm
            const age = userObj.age || 30; // Default 30yrs

            if (userObj.gender === 'FEMALE') {
                bmr = Math.round((10 * weight) + (6.25 * height) - (5 * age) - 161);
            } else {
                bmr = Math.round((10 * weight) + (6.25 * height) - (5 * age) + 5);
            }
        }

        const activeCaloriesBurned = workoutLogs.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
        const totalCaloriesBurned = activeCaloriesBurned + bmr;
        const totalCaloriesConsumed = dailyHealth.foods.reduce((sum, f) => sum + f.calories, 0);

        return res.json({
            dateStr,
            steps: dailyHealth.steps,
            sleepHours: dailyHealth.sleepHours,
            foods: dailyHealth.foods,
            water: totalWater,
            caloriesBurned: totalCaloriesBurned,
            activeCaloriesBurned,
            bmr,
            caloriesConsumed: totalCaloriesConsumed,
            netCalories: totalCaloriesConsumed - totalCaloriesBurned
        });
    } catch (error) {
        console.error('Error fetching daily summary', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateDailyHealth = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const dateStr = getGSTDateString();
        const { steps, sleepHours, foodItem } = req.body;

        let dailyHealth = await DailyHealth.findOne({ userId, dateStr });
        if (!dailyHealth) {
            dailyHealth = new DailyHealth({ userId, dateStr });
        }

        if (steps !== undefined) dailyHealth.steps = steps;
        if (sleepHours !== undefined) dailyHealth.sleepHours = sleepHours;

        if (foodItem) {
            dailyHealth.foods.push(foodItem);
        }

        await dailyHealth.save();

        res.json(dailyHealth);
    } catch (error) {
        console.error('Error updating daily health', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getReports = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const limit = parseInt(req.query.limit as string) || 30; // Past 30 days default

        const history = await DailyHealth.find({ userId })
            .sort({ dateStr: -1 })
            .limit(limit);

        res.json(history);
    } catch (error) {
        console.error('Error fetching reports', error);
        res.status(500).json({ message: 'Server error' });
    }
};
