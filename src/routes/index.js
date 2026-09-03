import express from 'express';
import authRoutes from './authRoutes.js';
import videoRoutes from './videoRoutes.js';
import documentRoutes from './documentRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import documentCategoryRoutes from './documentCategoryRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import userRoutes from './userRoutes.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Video & Document App API v1',
    endpoints: {
      health: 'GET /health',
      videos: 'GET/POST /api/v1/videos',
      documents: 'GET/POST /api/v1/documents',
      categories: 'GET/POST /api/v1/categories',
      documentCategories: 'GET/POST /api/v1/document-categories',
      dashboard: 'GET /api/v1/dashboard/stats',
      users: 'GET /api/v1/users'
    }
  });
});

router.use('/auth', authRoutes);
router.use('/videos', videoRoutes);
router.use('/documents', documentRoutes);
router.use('/categories', categoryRoutes);
router.use('/document-categories', documentCategoryRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/users', userRoutes);

export default router;
