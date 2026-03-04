import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import FriendRequest from '../models/FriendRequest';
import User from '../models/User';
import Post from '../models/Post';
import { logger } from '../utils/logger';

export const sendFriendRequest = async (req: AuthRequest, res: Response) => {
    try {
        const { receiverEmail } = req.body;
        const senderId = req.user?.id;

        const receiver = await User.findOne({ email: receiverEmail });
        if (!receiver) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (receiver._id.toString() === senderId) {
            return res.status(400).json({ message: 'Cannot friend yourself' });
        }

        const existingRequest = await FriendRequest.findOne({
            senderId,
            receiverId: receiver._id,
            status: 'PENDING'
        });

        if (existingRequest) {
            return res.status(400).json({ message: 'Request already pending' });
        }

        const request = new FriendRequest({
            senderId,
            receiverId: receiver._id,
        });

        await request.save();
        res.status(201).json(request);
    } catch (err) {
        res.status(500).json({ message: 'Server error sending request' });
    }
};

export const respondToRequest = async (req: AuthRequest, res: Response) => {
    try {
        const { requestId, status } = req.body; // status: 'ACCEPTED' or 'REJECTED'
        const userId = req.user?.id;

        const request = await FriendRequest.findById(requestId);
        if (!request || request.receiverId.toString() !== userId) {
            return res.status(404).json({ message: 'Request not found' });
        }

        request.status = status;
        await request.save();

        if (status === 'ACCEPTED') {
            await User.findByIdAndUpdate(userId, { $addToSet: { friends: request.senderId } });
            await User.findByIdAndUpdate(request.senderId, { $addToSet: { friends: userId } });
        }

        res.json({ message: `Request ${status.toLowerCase()}` });
    } catch (err) {
        res.status(500).json({ message: 'Server error responding to request' });
    }
};

export const getFriends = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const user = await User.findById(userId).populate('friends', 'name email points streaks avatar');
        res.json(user?.friends || []);
    } catch (err) {
        logger.error('Error fetching friends:', err);
        res.status(500).json({ message: 'Server error fetching friends' });
    }
};

export const createPost = async (req: AuthRequest, res: Response) => {
    try {
        const { content, workoutId } = req.body;
        const userId = req.user?.id;

        const post = new Post({
            userId,
            content,
            workoutId
        });

        await post.save();
        logger.info(`User ${userId} shared progress: ${content.substring(0, 20)}...`);
        res.status(201).json(post);
    } catch (err) {
        logger.error('Error creating post:', err);
        res.status(500).json({ message: 'Server error creating post' });
    }
};

export const getFeed = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const friendIds = user.friends;
        const feedIds = [userId, ...friendIds];

        const posts = await Post.find({ userId: { $in: feedIds } })
            .populate('userId', 'name username avatar points')
            .populate('workoutId')
            .sort({ createdAt: -1 })
            .limit(50);

        res.json(posts);
    } catch (err) {
        logger.error('Error fetching feed:', err);
        res.status(500).json({ message: 'Server error fetching feed' });
    }
};
