import { Router } from 'express';
import authRoutes from './auth';
import adminRoutes from './admin';
import projectRoutes from './project';
// import forumRoutes from './forum';
// import tokenCreationRoutes from './tokenCreation';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'florkanewfun-api'
  });
});

// Authentication routes (public)
router.use('/auth', authRoutes);

// Admin routes (protected)
router.use('/admin', adminRoutes);

// Project routes (mixed public/protected)
router.use('/projects', projectRoutes);

// Forum routes (protected)
// router.use('/forum', forumRoutes);

// Token creation routes (protected)
// router.use('/token-creation', tokenCreationRoutes);

export default router;