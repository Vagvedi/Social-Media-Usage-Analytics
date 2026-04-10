import express from 'express';
import {
  getDashboard,
  getStats,
  getRiskScore
} from '../controllers/analyticsController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/dashboard', getDashboard);
router.get('/stats', getStats);
router.get('/risk-score', getRiskScore);

export default router;
