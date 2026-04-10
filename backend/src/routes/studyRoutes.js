import express from 'express';
import { body } from 'express-validator';
import {
  startStudySession,
  endStudySession,
  getActiveSession,
  getStudySessions,
  createStudyGoal,
  getStudyGoals,
  updateStudyGoal,
  deleteStudyGoal,
  getStudyAnalytics
} from '../controllers/studyController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validator.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Session validation rules
const sessionValidation = [
  body('subject').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Subject must be between 1 and 100 characters'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes must not exceed 500 characters'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
];

// Goal validation rules
const goalValidation = [
  body('subject').trim().isLength({ min: 1, max: 100 }).withMessage('Subject is required and must be between 1 and 100 characters'),
  body('targetHours').isFloat({ min: 0.1, max: 1000 }).withMessage('Target hours must be between 0.1 and 1000'),
  body('deadline').isISO8601().withMessage('Valid deadline date is required'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),
  body('color').optional().isHexColor().withMessage('Color must be a valid hex color'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must not exceed 500 characters')
];

// Study Session Routes
router.post('/sessions/start', sessionValidation, validate, startStudySession);

router.post('/sessions/:sessionId/end', [
  body('productivity').optional().isIn(['low', 'medium', 'high']),
  body('notes').optional().trim().isLength({ max: 500 })
], validate, endStudySession);

router.get('/sessions/active', getActiveSession);

router.get('/sessions', getStudySessions);

// Study Goal Routes
router.post('/goals', goalValidation, validate, createStudyGoal);

router.get('/goals', getStudyGoals);

router.put('/goals/:goalId', updateStudyGoal);

router.delete('/goals/:goalId', deleteStudyGoal);

// Study Analytics Routes
router.get('/analytics', getStudyAnalytics);

export default router;
