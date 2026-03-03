import { Router } from 'express';
import { sendFriendRequest, respondToRequest, getFriends } from '../controllers/socialController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.post('/request', sendFriendRequest);
router.post('/respond', respondToRequest);
router.get('/friends', getFriends);

export default router;
