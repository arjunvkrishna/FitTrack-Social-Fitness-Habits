import { Router } from 'express';
import { getExercises, createExercise } from '../controllers/exerciseController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Publicly available to authenticated users for the dropdown
router.get('/', authMiddleware, getExercises);

// Admin only (role check inside controller)
router.post('/', authMiddleware, createExercise);

export default router;
