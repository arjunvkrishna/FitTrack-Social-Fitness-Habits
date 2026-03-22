import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import WorkoutTemplate from '../models/WorkoutTemplate';

export const createTemplate = async (req: AuthRequest, res: Response) => {
    try {
        const { name, exercises } = req.body;
        const userId = req.user?.id;

        const template = new WorkoutTemplate({
            userId,
            name,
            exercises
        });

        await template.save();
        res.status(201).json(template);
    } catch (err) {
        res.status(500).json({ message: 'Error creating workout template' });
    }
};

export const getTemplates = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const templates = await WorkoutTemplate.find({ userId }).sort({ updatedAt: -1 });
        res.json(templates);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching workout templates' });
    }
};

export const updateTemplate = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { name, exercises } = req.body;
        const userId = req.user?.id;

        const template = await WorkoutTemplate.findOneAndUpdate(
            { _id: id, userId },
            { $set: { name, exercises } },
            { new: true }
        );

        if (!template) return res.status(404).json({ message: 'Template not found' });
        res.json(template);
    } catch (err) {
        res.status(500).json({ message: 'Error updating workout template' });
    }
};

export const getTemplate = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const template = await WorkoutTemplate.findOne({ _id: id, userId })
            .populate('exercises.exerciseId');
        
        if (!template) return res.status(404).json({ message: 'Template not found' });
        res.json(template);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching workout template' });
    }
};

export const deleteTemplate = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const template = await WorkoutTemplate.findOneAndDelete({ _id: id, userId });
        if (!template) return res.status(404).json({ message: 'Template not found' });
        res.json({ message: 'Template deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting workout template' });
    }
};
