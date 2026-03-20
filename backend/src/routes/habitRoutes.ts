import { Router } from 'express';
import { addWaterIntake, getWaterHistory, editWaterIntake, deleteWaterIntake, logWorkout, getWorkoutHistory, resetUserStats } from '../controllers/habitController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.post('/water', addWaterIntake);
router.get('/water', getWaterHistory);
router.put('/water/:id', editWaterIntake);
router.delete('/water/:id', deleteWaterIntake);
router.post('/workout', logWorkout);
router.get('/workout', getWorkoutHistory);

// Admin
router.post('/admin/reset-stats', adminMiddleware, resetUserStats);

export default router;
