import express from 'express';
import { authMiddleware } from '../middleware/auth';
import { getDailySummary, updateDailyHealth, getReports } from '../controllers/healthController';

const router = express.Router();

router.use(authMiddleware as any);

router.get('/daily', getDailySummary);
router.post('/daily', updateDailyHealth);
router.get('/reports', getReports);

export default router;
