import express from 'express';
import authRoutes from './authRoutes.js';
import videoRoutes from './videoRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import userRoutes from './userRoutes.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Video App API v1',
    endpoints: {
      health: 'GET /health',
      auth: {
        register: 'POST /api/v1/auth/register',
        login: 'POST /api/v1/auth/login',
        me: 'GET /api/v1/auth/me (Protected)'
      },
      videos: {
        list: 'GET /api/v1/videos',
        details: 'GET /api/v1/videos/:id',
        create: 'POST /api/v1/videos (Protected)',
        like: 'POST /api/v1/videos/:id/like (Protected)',
        comments: 'GET/POST /api/v1/videos/:id/comments'
      },
      categories: {
        list: 'GET /api/v1/categories',
        create: 'POST /api/v1/categories (Admin)'
      },
      dashboard: {
        stats: 'GET /api/v1/dashboard/stats (Admin)'
      }
    }
  });
});

router.use('/auth', authRoutes);
router.use('/videos', videoRoutes);
router.use('/categories', categoryRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/users', userRoutes);

export default router;
