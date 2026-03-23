import { Router } from 'express';
import { getPosts, createPost, likePost, commentOnPost, deletePost } from '../controllers/socialController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', getPosts);
router.post('/post', createPost);
router.post('/:id/like', likePost);
router.post('/:id/comment', commentOnPost);
router.delete('/:id', deletePost);

export default router;
