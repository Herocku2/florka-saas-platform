import { Router } from 'express';
import { verifyToken, optionalAuth, requireRole } from '../middleware/auth';
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectsByUser,
  getPublicProjects
} from '../controllers/projectController';

const router = Router();

// Public routes (no authentication required)
router.get('/public', getPublicProjects);
router.get('/public/:id', getProjectById);

// Routes with optional authentication
router.get('/', optionalAuth, getAllProjects);
router.get('/:id', optionalAuth, getProjectById);

// Protected routes (authentication required)
router.post('/', verifyToken, createProject);
router.put('/:id', verifyToken, updateProject);
router.delete('/:id', verifyToken, deleteProject);
router.get('/user/my-projects', verifyToken, getProjectsByUser);

export default router;