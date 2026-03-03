import express from 'express';
import { updateProfile, updatePassword, updateProfilePicture, searchUsers, getProfile } from '../controllers/userController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.put('/profile', authMiddleware, updateProfile);
router.put('/password', authMiddleware, updatePassword);
router.put('/profile-picture', authMiddleware, updateProfilePicture);
router.get('/search', authMiddleware, searchUsers);
router.get('/:username', authMiddleware, getProfile);

export default router;
