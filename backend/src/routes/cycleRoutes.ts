import { Router } from 'express';
import { 
    logCycle, 
    getCycleStatus, 
    getCycleHistory, 
    getCycleInsights, 
    getDailyLog, 
    createOrUpdateDailyLog 
} from '../controllers/cycleController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.post('/', logCycle);
router.get('/history', getCycleHistory);
router.get('/status', getCycleStatus);
router.get('/insights', getCycleInsights);
router.get('/daily', getDailyLog);
router.post('/daily', createOrUpdateDailyLog);

export default router;
