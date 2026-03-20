import { Router } from 'express';
import { createBucketList, getMyBucketLists, updateTaskStatus } from '../controllers/bucketListController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.post('/', createBucketList);
router.get('/', getMyBucketLists);
router.patch('/task', updateTaskStatus);

export default router;
