import express from 'express';
import {
    updateProfile,
    updatePassword,
    updateProfilePicture,
    searchUsers,
    getProfile,
    getAllUsers,
    updateUserStatus,
    adminResetPassword,
    deleteUser
} from '../controllers/userController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = express.Router();

router.put('/profile', authMiddleware, updateProfile);
router.put('/password', authMiddleware, updatePassword);
router.put('/profile-picture', authMiddleware, updateProfilePicture);
router.get('/search', authMiddleware, searchUsers);

// Admin Management
router.get('/admin/all', authMiddleware, adminMiddleware, getAllUsers);
router.put('/admin/status', authMiddleware, adminMiddleware, updateUserStatus);
router.put('/admin/reset-password', authMiddleware, adminMiddleware, adminResetPassword);
router.delete('/admin/:userId', authMiddleware, adminMiddleware, deleteUser);

router.get('/:username', authMiddleware, getProfile);

export default router;
