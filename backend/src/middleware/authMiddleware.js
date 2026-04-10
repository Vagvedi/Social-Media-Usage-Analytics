import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware to verify JWT access token
 * Protects routes that require authentication
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please provide a valid token.'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      
      // Find user by ID
      const user = await User.findByPk(decoded.userId);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found. Token is invalid.'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired. Please refresh your session.',
          code: 'TOKEN_EXPIRED'
        });
      }
      
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please authenticate again.'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authentication error. Please try again.'
    });
  }
};
