import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import FriendRequest from '../models/FriendRequest';
import User from '../models/User';

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
        res.status(500).json({ message: 'Server error fetching friends' });
    }
};
