import { Router } from 'express';
import { logCycle, getCyclePredictions, getCycleHistory } from '../controllers/cycleController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.post('/', logCycle);
router.get('/predictions', getCyclePredictions);
router.get('/history', getCycleHistory);

export default router;
