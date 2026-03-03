import { Router } from 'express';
import { addWaterIntake, getWaterHistory, logWorkout, getWorkoutHistory } from '../controllers/habitController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.post('/water', addWaterIntake);
router.get('/water', getWaterHistory);
router.post('/workout', logWorkout);
router.get('/workout', getWorkoutHistory);

export default router;
