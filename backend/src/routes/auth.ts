import { Router } from 'express';
import {
  register,
  login,
  adminLogin,
  getProfile,
  logout,
  getAdminAccess
} from '../controllers/authController';
import { verifyToken, requireRole, rateLimit } from '../middleware/auth';

const router = Router();

// Rate limiting for auth routes
const authRateLimit = rateLimit(5, 15 * 60 * 1000); // 5 requests per 15 minutes
const loginRateLimit = rateLimit(3, 15 * 60 * 1000); // 3 login attempts per 15 minutes

// Public routes
router.post('/register', authRateLimit, register);
router.post('/login', loginRateLimit, login);
router.post('/admin/login', loginRateLimit, adminLogin);

// Protected routes
router.get('/profile', verifyToken, getProfile);
router.post('/logout', verifyToken, logout);

// Admin routes
router.get('/admin/access', verifyToken, requireRole(['ADMIN', 'SUPER_ADMIN']), getAdminAccess);

export default router;