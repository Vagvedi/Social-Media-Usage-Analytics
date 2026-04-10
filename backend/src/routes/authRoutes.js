import express from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  getMe
} from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validateRegister, validateLogin } from '../middleware/validator.js';

const router = express.Router();

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/refresh', refreshToken);

// Protected routes (require authentication)
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

export default router;
