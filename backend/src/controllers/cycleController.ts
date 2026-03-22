import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import MenstrualCycle from '../models/MenstrualCycle';
import MenstrualLog from '../models/MenstrualLog';
import User from '../models/User';
import { addDays, subDays, differenceInDays, isSameDay, startOfDay } from 'date-fns';

const DISCLAIMER = "FitTrack is NOT a contraceptive method. DO NOT use for birth control.";

// Helper: Calculate personal averages from last 3+ cycles
const updatePersonalAverages = async (userId: string) => {
    const user = await User.findById(userId);
    if (!user) return;

    const cycles = await MenstrualCycle.find({ userId }).sort({ startDate: -1 }).limit(6);
    if (cycles.length < 3) return;

    // Calculate typical cycle length
    const totalLength = cycles.reduce((acc: number, c: any) => acc + (c.cycleLength || 28), 0);
    const avgCycleLength = Math.round(totalLength / cycles.length);

    // Calculate luteal phase length from confirmed ovulation
    const lutealLengths: number[] = [];
    for (let i = 0; i < cycles.length - 1; i++) {
        const nextCycleStart = new Date(cycles[i].startDate);
        const currentCycleStart = new Date(cycles[i+1].startDate);

        // Find ovulation in the current (older) cycle i+1
        const ovLog = await MenstrualLog.findOne({
            userId,
            date: { $gte: currentCycleStart, $lt: nextCycleStart },
            opkResult: 'PEAK'
        });

        if (ovLog) {
            const ovDate = addDays(new Date(ovLog.date), 1);
            lutealLengths.push(differenceInDays(nextCycleStart, ovDate));
        }
    }

    if (lutealLengths.length > 0) {
        user.cycleSettings.lutealPhaseLength = Math.round(lutealLengths.reduce((a, b) => a + b, 0) / lutealLengths.length);
    }

    user.cycleSettings.typicalCycleLength = avgCycleLength;
    await user.save();
};

export const createOrUpdateDailyLog = async (req: AuthRequest, res: Response) => {
    try {
        const { date, bbt, bbtFlags, cervicalMucus, opkResult, symptoms, vitals, notes } = req.body;
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const logDate = startOfDay(new Date(date));

        const log = await MenstrualLog.findOneAndUpdate(
            { userId, date: logDate },
            { 
                $set: { 
                    bbt, bbtFlags, cervicalMucus, opkResult, symptoms, vitals, notes 
                } 
            },
            { upsert: true, new: true }
        );

        res.json(log);
    } catch (err) {
        res.status(500).json({ message: 'Error saving daily log' });
    }
};

export const getDailyLog = async (req: AuthRequest, res: Response) => {
    try {
        const { date } = req.query;
        const userId = req.user?.id;
        const logDate = startOfDay(new Date(date as string));

        const log = await MenstrualLog.findOne({ userId, date: logDate });
        res.json(log || { date: logDate, symptoms: {}, vitals: {} });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching daily log' });
    }
};

export const getCycleStatus = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const user = await User.findById(userId);
        const latestCycle = await MenstrualCycle.findOne({ userId }).sort({ startDate: -1 });
        
        if (!latestCycle) {
            return res.json({ 
                message: 'No cycle data found', 
                disclaimer: DISCLAIMER 
            });
        }

        // Fetch recent logs to look for signals
        const recentLogs = await MenstrualLog.find({ 
            userId, 
            date: { $gte: subDays(new Date(), 35) } 
        }).sort({ date: 1 });

        let prediction = calculateTieredPrediction(latestCycle, recentLogs, user?.cycleSettings);
        
        res.json({
            currentCycle: latestCycle,
            prediction,
            disclaimer: DISCLAIMER,
            phase: calculateCyclePhase(latestCycle, prediction.predictedDate)
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error calculating status' });
    }
};

// Tiered Confidence Algorithm
const calculateTieredPrediction = (latestCycle: any, logs: any[], settings: any) => {
    const cycleStart = new Date(latestCycle.startDate);
    const avgCycleLength = settings?.typicalCycleLength || 28;
    const lutealLength = settings?.lutealPhaseLength || 14;

    // 1. Check for OPK Peak (Very High Confidence)
    const opkPeak = logs.find(l => l.opkResult === 'PEAK');
    if (opkPeak) {
        const ovDate = addDays(new Date(opkPeak.date), 1);
        return {
            predictedDate: addDays(ovDate, lutealLength),
            ovulationDate: ovDate,
            confidence: 'VERY_HIGH',
            signal: 'OPK_PEAK'
        };
    }

    // 2. Check for BBT Shift (High Confidence)
    // Simplistic shift detection: 3 days > previous 6
    if (logs.length >= 9) {
        // ... logic for BBT shift ...
    }

    // 3. Peak CM (Moderate Confidence)
    const peakCM = logs.reverse().find(l => l.cervicalMucus === 'EGG_WHITE');
    if (peakCM) {
        return {
            predictedDate: addDays(new Date(peakCM.date), lutealLength + 1), // assume ov was today/tmrw
            confidence: 'MODERATE',
            signal: 'PEAK_CM'
        };
    }

    // 4. Fallback (Low Confidence)
    const predictedDate = addDays(cycleStart, avgCycleLength);
    return {
        predictedDate,
        ovulationDate: addDays(cycleStart, avgCycleLength - lutealLength),
        confidence: 'LOW',
        signal: 'CALENDAR'
    };
};

const calculateCyclePhase = (cycle: any, nextPeriod: Date) => {
    const today = new Date();
    const start = new Date(cycle.startDate);
    const day = differenceInDays(today, start) + 1;

    if (day <= (cycle.periodDuration || 5)) return 'MENSTRUAL';
    if (today < subDays(nextPeriod, 14)) return 'FOLLICULAR';
    if (today < subDays(nextPeriod, 12)) return 'OVULATORY';
    return 'LUTEAL';
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

export const getCycleInsights = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const cycles = await MenstrualCycle.find({ userId }).sort({ startDate: -1 }).limit(6);
        if (cycles.length < 3) {
            return res.json({ 
                message: 'Need 3+ cycles for insights',
                hasEnoughData: false 
            });
        }

        const lengths = cycles.map(c => c.cycleLength || 28);
        const avgCycleLength = Math.round(lengths.reduce((a: number, b: number) => a + b, 0) / lengths.length);
        
        // Regularity (Standard Deviation)
        const variance = lengths.reduce((acc: number, len: number) => acc + Math.pow(len - avgCycleLength, 2), 0) / lengths.length;
        const stdDev = Math.sqrt(variance);
        const regularity = stdDev < 2 ? 'HIGH' : stdDev < 4 ? 'MODERATE' : 'LOW';

        res.json({
            hasEnoughData: true,
            avgCycleLength,
            avgLutealLength: user.cycleSettings.lutealPhaseLength,
            regularity,
            stdDev: Math.round(stdDev * 10) / 10,
            typicalPMSOnset: Math.round(avgCycleLength - 4) // Simplistic estimation
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching insights' });
    }
};

export const logCycle = async (req: AuthRequest, res: Response) => {
    try {
        const { startDate, endDate, cycleLength, periodDuration, symptoms, notes } = req.body;
        const userId = req.user?.id;

        const cycle = await MenstrualCycle.findOneAndUpdate(
            { userId, startDate: startOfDay(new Date(startDate)) },
            { 
                $set: { 
                    endDate: endDate ? startOfDay(new Date(endDate)) : undefined, 
                    cycleLength, 
                    periodDuration, 
                    symptoms, 
                    notes 
                } 
            },
            { upsert: true, new: true }
        );

        await updatePersonalAverages(userId as string);
        res.status(201).json(cycle);
    } catch (err) {
        res.status(500).json({ message: 'Server error logging cycle' });
    }
};

