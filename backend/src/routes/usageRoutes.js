import express from 'express';
import {
  createUsageLog,
  getUsageLogs,
  getUsageLogById,
  updateUsageLog,
  deleteUsageLog
} from '../controllers/usageController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validateUsageLog } from '../middleware/validator.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.post('/', validateUsageLog, createUsageLog);
router.get('/', getUsageLogs);
router.get('/:id', getUsageLogById);
router.put('/:id', validateUsageLog, updateUsageLog);
router.delete('/:id', deleteUsageLog);

export default router;
