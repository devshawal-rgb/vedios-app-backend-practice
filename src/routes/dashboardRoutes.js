import express from 'express';
import { getStats, flushDatabase } from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/stats', getStats);
router.delete('/flush', flushDatabase);

export default router;
