import { Router } from 'express';
import { register, login, checkSetupRequired, setupAdmin } from '../controllers/authController';

const router = Router();

router.get('/setup-status', checkSetupRequired);
router.post('/setup', setupAdmin);
router.post('/register', register);
router.post('/login', login);

export default router;
