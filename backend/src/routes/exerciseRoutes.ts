import { Router } from 'express';
import { getExercises, createExercise, updateExercise, deleteExercise } from '../controllers/exerciseController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

// Publicly available to authenticated users for the dropdown
router.get('/', authMiddleware, getExercises);

// Admin only
router.post('/', authMiddleware, adminMiddleware, createExercise);
router.put('/:id', authMiddleware, adminMiddleware, updateExercise);
router.delete('/:id', authMiddleware, adminMiddleware, deleteExercise);

export default router;
