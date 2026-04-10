import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { Op, ValidationError, UniqueConstraintError } from 'sequelize';

/**
 * Generate JWT tokens (access + refresh)
 * @param {Number} userId - User ID
 * @returns {Object} Tokens object
 * @throws {Error} If JWT secrets are not configured
 */
const generateTokens = (userId) => {
  console.log('[Auth Controller] Generating tokens for userId:', userId);

  if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
    console.error('[Auth Controller] JWT secrets not configured!');
    throw new Error('JWT secrets not configured');
  }

  try {
    const accessToken = jwt.sign(
      { userId },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
    );

    const refreshToken = jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    console.log('[Auth Controller] Tokens generated successfully');
    return { accessToken, refreshToken };
  } catch (error) {
    console.error('[Auth Controller] Token generation error:', error);
    throw error;
  }
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  console.log('[Auth Controller] Register request received');
  console.log('[Auth Controller] Request body:', {
    username: req.body?.username,
    email: req.body?.email,
    password: req.body?.password ? '***' : undefined
  });

  // Validate required fields
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    console.log('[Auth Controller] Missing required fields');
    return res.status(400).json({
      success: false,
      message: 'Username, email, and password are required'
    });
  }

  // Validate input types
  if (typeof username !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
    console.log('[Auth Controller] Invalid field types');
    return res.status(400).json({
      success: false,
      message: 'Invalid input types'
    });
  }

  // Normalize email (lowercase)
  const normalizedEmail = email.toLowerCase().trim();

  try {
    // Check if user already exists
    console.log('[Auth Controller] Checking for existing user');
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email: normalizedEmail },
          { username: username.trim() }
        ]
      }
    });

    if (existingUser) {
      console.log('[Auth Controller] User already exists:', existingUser.email);
      const field = existingUser.email === normalizedEmail ? 'email' : 'username';
      return res.status(409).json({
        success: false,
        message: `User with this ${field} already exists`
      });
    }

    // Create new user (password will be hashed by hook)
    console.log('[Auth Controller] Creating new user');
    const user = await User.create({
      username: username.trim(),
      email: normalizedEmail,
      password: password
    });

    console.log('[Auth Controller] User created successfully, ID:', user.id);

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Save refresh token to database
    user.refreshToken = refreshToken;
    await user.save();

    console.log('[Auth Controller] Registration successful for user:', user.id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
  } catch (error) {
    console.error('[Auth Controller] Registration error:', error);

    // Handle Sequelize validation errors
    if (error instanceof ValidationError) {
      const messages = error.errors.map(e => e.message).join(', ');
      return res.status(400).json({
        success: false,
        message: `Validation error: ${messages}`
      });
    }

    // Handle unique constraint errors
    if (error instanceof UniqueConstraintError) {
      const field = error.errors[0]?.path || 'field';
      return res.status(409).json({
        success: false,
        message: `${field} already exists`
      });
    }

    // Re-throw to be handled by errorHandler middleware
    throw error;
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  console.log('[Auth Controller] Login request received');
  console.log('[Auth Controller] Request body:', {
    email: req.body?.email,
    password: req.body?.password ? '***' : undefined
  });

  // Validate required fields
  const { email, password } = req.body;

  if (!email || !password) {
    console.log('[Auth Controller] Missing email or password');
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  // Validate input types
  if (typeof email !== 'string' || typeof password !== 'string') {
    console.log('[Auth Controller] Invalid field types');
    return res.status(400).json({
      success: false,
      message: 'Email and password must be strings'
    });
  }

  // Normalize email
  const normalizedEmail = email.toLowerCase().trim();

  try {
    // Find user
    console.log('[Auth Controller] Finding user by email');
    const user = await User.findOne({
      where: { email: normalizedEmail }
    });

    if (!user) {
      console.log('[Auth Controller] User not found:', normalizedEmail);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    console.log('[Auth Controller] User found, comparing password');
    // Compare password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      console.log('[Auth Controller] Invalid password');
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    console.log('[Auth Controller] Password valid, generating tokens');

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Save refresh token to database
    user.refreshToken = refreshToken;
    await user.save();

    console.log('[Auth Controller] Login successful for user:', user.id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
  } catch (error) {
    console.error('[Auth Controller] Login error:', error);
    // Re-throw to be handled by errorHandler middleware
    throw error;
  }
});

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
export const refreshToken = asyncHandler(async (req, res) => {
  console.log('[Auth Controller] Refresh token request received');

  const { refreshToken: token } = req.body;

  if (!token) {
    console.log('[Auth Controller] Refresh token missing');
    return res.status(400).json({
      success: false,
      message: 'Refresh token is required'
    });
  }

  if (typeof token !== 'string') {
    console.log('[Auth Controller] Invalid refresh token type');
    return res.status(400).json({
      success: false,
      message: 'Refresh token must be a string'
    });
  }

  try {
    // Verify refresh token
    console.log('[Auth Controller] Verifying refresh token');
    if (!process.env.JWT_REFRESH_SECRET) {
      throw new Error('JWT_REFRESH_SECRET not configured');
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    console.log('[Auth Controller] Token verified, userId:', decoded.userId);

    // Find user with matching refresh token
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      console.log('[Auth Controller] User not found for token');
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    if (user.refreshToken !== token) {
      console.log('[Auth Controller] Refresh token mismatch');
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id);

    // Update refresh token in database
    user.refreshToken = newRefreshToken;
    await user.save();

    console.log('[Auth Controller] Token refreshed successfully');

    res.json({
      success: true,
      data: {
        tokens: {
          accessToken,
          refreshToken: newRefreshToken
        }
      }
    });
  } catch (error) {
    console.error('[Auth Controller] Refresh token error:', error);

    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

    // Re-throw to be handled by errorHandler middleware
    throw error;
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (invalidate refresh token)
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  console.log('[Auth Controller] Logout request received for user:', req.user?.id);

  try {
    const user = await User.findByPk(req.user.id);

    if (user) {
      user.refreshToken = null;
      await user.save();
      console.log('[Auth Controller] User logged out successfully');
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('[Auth Controller] Logout error:', error);
    // Even if update fails, return success (best effort)
    res.json({
      success: true,
      message: 'Logout successful'
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
  console.log('[Auth Controller] Get me request for user:', req.user?.id);

  try {
    res.json({
      success: true,
      data: {
        user: {
          id: req.user.id,
          username: req.user.username,
          email: req.user.email,
          createdAt: req.user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('[Auth Controller] Get me error:', error);
    throw error;
  }
});
