import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Send, Trash2, User as UserIcon, Share2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface Post {
    _id: string;
    userId: {
        _id: string;
        name: string;
        username: string;
        profilePicture?: string;
    };
    content: string;
    likes: string[];
    comments: {
        userId: {
            name: string;
            username: string;
        };
        text: string;
        createdAt: string;
    }[];
    createdAt: string;
}

const Feed = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [newPost, setNewPost] = useState('');
    const [loading, setLoading] = useState(true);
    const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await axios.get('/api/social');
            setPosts(res.data);
        } catch (err) {
            console.error('Error fetching posts', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPost.trim()) return;
        try {
            const res = await axios.post('/api/social/post', { content: newPost });
            setPosts([res.data, ...posts]);
            setNewPost('');
        } catch (err) {
            console.error('Error creating post', err);
        }
    };

    const handleLike = async (postId: string) => {
        try {
            const res = await axios.post(`/api/social/${postId}/like`);
            setPosts(posts.map(p => p._id === postId ? { ...p, likes: res.data.likes } : p));
        } catch (err) {
            console.error('Error liking post', err);
        }
    };

    const handleComment = async (postId: string) => {
        const text = commentTexts[postId];
        if (!text?.trim()) return;
        try {
            const res = await axios.post(`/api/social/${postId}/comment`, { text });
            setPosts(posts.map(p => p._id === postId ? res.data : p));
            setCommentTexts({ ...commentTexts, [postId]: '' });
        } catch (err) {
            console.error('Error commenting', err);
        }
    };

    const handleDelete = async (postId: string) => {
        if (!confirm('Delete this post?')) return;
        try {
            await axios.delete(`/api/social/${postId}`);
            setPosts(posts.filter(p => p._id !== postId));
        } catch (err) {
            console.error('Error deleting post', err);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div></div>;
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8 px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-6"
            >
                <form onSubmit={handleCreatePost} className="space-y-4">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                            <UserIcon className="text-primary" />
                        </div>
                        <textarea
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary resize-none h-24"
                            placeholder="Share your fitness journey..."
                            value={newPost}
                            onChange={(e) => setNewPost(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="btn-primary flex items-center gap-2 px-6">
                            <Send size={18} /> Post
                        </button>
                    </div>
                </form>
            </motion.div>

            <div className="space-y-6">
                <AnimatePresence mode="popLayout">
                    {posts.map((post) => (
                        <motion.div
                            key={post._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="glass p-6 space-y-4"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                        {post.userId.profilePicture ? (
                                            <img src={post.userId.profilePicture} alt="" className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            <UserIcon className="text-primary" size={20} />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold">{post.userId.name}</p>
                                        <p className="text-xs text-text-muted">
                                            @{post.userId.username} • {formatDistanceToNow(new Date(post.createdAt))} ago
                                        </p>
                                    </div>
                                </div>
                                {((user?.id || (user as any)?._id) === post.userId._id || user?.username === 'admin') && (
                                    <button onClick={() => handleDelete(post._id)} className="text-text-muted hover:text-red-400 transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>

                            <p className="text-lg leading-relaxed">{post.content}</p>

                            <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                                <button
                                    onClick={() => handleLike(post._id)}
                                    className={`flex items-center gap-2 transition-colors ${
                                        post.likes.includes(user?.id || (user as any)?._id || '') ? 'text-secondary' : 'text-text-muted hover:text-secondary'
                                    }`}
                                >
                                    <Heart size={20} fill={post.likes.includes(user?.id || (user as any)?._id || '') ? 'currentColor' : 'none'} />
                                    <span className="text-sm font-bold">{post.likes.length}</span>
                                </button>
                                <div className="flex items-center gap-2 text-text-muted">
                                    <MessageCircle size={20} />
                                    <span className="text-sm font-bold">{post.comments.length}</span>
                                </div>
                                <button className="text-text-muted hover:text-primary transition-colors ml-auto">
                                    <Share2 size={20} />
                                </button>
                            </div>

                            {/* Comments Section */}
                            <div className="space-y-4 pt-4">
                                {post.comments.map((comment, idx) => (
                                    <div key={idx} className="flex gap-3 bg-white/5 p-3 rounded-xl">
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                            <UserIcon size={14} className="text-text-muted" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold">@{comment.userId.username}</p>
                                            <p className="text-sm">{comment.text}</p>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="Write a comment..."
                                        value={commentTexts[post._id] || ''}
                                        onChange={(e) => setCommentTexts({ ...commentTexts, [post._id]: e.target.value })}
                                        onKeyDown={(e) => e.key === 'Enter' && handleComment(post._id)}
                                    />
                                    <button
                                        onClick={() => handleComment(post._id)}
                                        className="p-2 bg-primary/20 text-primary rounded-xl hover:bg-primary hover:text-white transition-all"
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Feed;
