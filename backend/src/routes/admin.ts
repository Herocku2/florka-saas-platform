import { Router } from 'express';
import { verifyToken, requireRole } from '../middleware/auth';
import {
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  getAdminStats,
  getAllProjects,
  updateProjectStatus,
  deleteProject
} from '../controllers/adminController';

const router = Router();

// All admin routes require authentication and admin role
router.use(verifyToken);
router.use(requireRole(['ADMIN', 'SUPER_ADMIN']));

// Dashboard stats
router.get('/stats', getAdminStats);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

// Project management
router.get('/projects', getAllProjects);
router.patch('/projects/:id/status', updateProjectStatus);
router.delete('/projects/:id', deleteProject);

export default router;