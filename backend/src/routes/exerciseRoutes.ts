import express, { Router } from 'express';
import { getExercises, createExercise, updateExercise, deleteExercise, exportExercises, importExercises } from '../controllers/exerciseController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

// Publicly available to authenticated users for the dropdown
router.get('/', authMiddleware, getExercises);

// Admin only
router.get('/export', authMiddleware, adminMiddleware, exportExercises);
router.post('/import', express.text({ type: 'text/csv', limit: '1mb' }), authMiddleware, adminMiddleware, importExercises);
router.post('/', authMiddleware, adminMiddleware, createExercise);
router.put('/:id', authMiddleware, adminMiddleware, updateExercise);
router.delete('/:id', authMiddleware, adminMiddleware, deleteExercise);

export default router;
