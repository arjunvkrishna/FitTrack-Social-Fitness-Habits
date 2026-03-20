import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import BucketList from '../models/BucketList';

export const createBucketList = async (req: AuthRequest, res: Response) => {
    try {
        const { title, category, deadline, tasks, isShared, sharedWithEmails } = req.body;
        const userId = req.user?.id;

        const bucketList = new BucketList({
            userId,
            title,
            category,
            deadline,
            tasks,
            isShared,
        });

        // Handle sharing logic if emails provided
        // (Simplified for now)

        await bucketList.save();
        res.status(201).json(bucketList);
    } catch (err) {
        res.status(500).json({ message: 'Server error creating bucket list' });
    }
};

export const getMyBucketLists = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const lists = await BucketList.find({
            $or: [
                { userId: userId },
                { sharedWith: userId }
            ]
        });
        res.json(lists);
    } catch (err) {
        res.status(500).json({ message: 'Server error fetching bucket lists' });
    }
};

export const updateTaskStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { listId, taskId, isDone } = req.body;
        const list = await BucketList.findById(listId);

        if (!list) return res.status(404).json({ message: 'List not found' });

        const task = list.tasks.find(t => (t as any)._id.toString() === taskId);
        if (task) {
            task.isDone = isDone;
            await list.save();
        }

        res.json(list);
    } catch (err) {
        res.status(500).json({ message: 'Server error updating task' });
    }
};
