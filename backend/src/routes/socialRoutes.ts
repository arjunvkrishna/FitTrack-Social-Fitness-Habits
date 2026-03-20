import { Router } from 'express';
import { sendFriendRequest, respondToRequest, getFriends, createPost, getFeed } from '../controllers/socialController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.post('/request', sendFriendRequest);
router.post('/respond', respondToRequest);
router.get('/friends', getFriends);
router.post('/post', createPost);
router.get('/feed', getFeed);

export default router;
