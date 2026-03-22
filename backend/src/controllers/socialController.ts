import { Request, Response } from 'express';
import Post, { IPost } from '../models/Post';
import mongoose from 'mongoose';

// Extended request to include userId from authMiddleware
interface AuthRequest extends Request {
    userId?: string;
}

export const getPosts = async (req: AuthRequest, res: Response) => {
    try {
        const posts = await Post.find()
            .populate('userId', 'name username profilePicture')
            .populate('comments.userId', 'name username')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const createPost = async (req: AuthRequest, res: Response) => {
    const { content, workoutId } = req.body;
    try {
        const newPost = new Post({
            userId: req.userId,
            content,
            workoutId
        });
        await newPost.save();
        const populatedPost = await Post.findById(newPost._id).populate('userId', 'name username profilePicture');
        res.status(201).json(populatedPost);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const likePost = async (req: AuthRequest, res: Response) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const userIdObj = new mongoose.Types.ObjectId(req.userId);
        const likeIndex = post.likes.indexOf(userIdObj);

        if (likeIndex === -1) {
            post.likes.push(userIdObj);
        } else {
            post.likes.splice(likeIndex, 1);
        }

        await post.save();
        res.json(post);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const commentOnPost = async (req: AuthRequest, res: Response) => {
    const { text } = req.body;
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        post.comments.push({
            userId: new mongoose.Types.ObjectId(req.userId),
            text,
            createdAt: new Date()
        } as any);

        await post.save();
        const populatedPost = await Post.findById(post._id)
            .populate('userId', 'name username profilePicture')
            .populate('comments.userId', 'name username');
        res.json(populatedPost);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const deletePost = async (req: AuthRequest, res: Response) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        if (post.userId.toString() !== req.userId && req.userId !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized to delete this post' });
        }

        await post.deleteOne();
        res.json({ message: 'Post deleted successfully' });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};
