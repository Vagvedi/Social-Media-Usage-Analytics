import { body, validationResult } from 'express-validator';

/**
 * Validation result handler
 * Checks validation results and returns errors if any
 * Always returns JSON response
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    console.log('[Validator] Validation failed:', errors.array());
    
    // Extract the first error message for simplicity
    const firstError = errors.array()[0];
    const message = firstError?.msg || 'Validation failed';
    
    return res.status(400).json({
      success: false,
      message,
      errors: errors.array()
    });
  }
  
  next();
};

/**
 * Registration validation rules
 */
export const validateRegister = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  validate
];

/**
 * Login validation rules
 */
export const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  validate
];

/**
 * Usage log validation rules
 */
export const validateUsageLog = [
  body('appName')
    .trim()
    .notEmpty()
    .withMessage('App name is required')
    .isLength({ max: 100 })
    .withMessage('App name cannot exceed 100 characters'),
  
  body('minutesSpent')
    .isFloat({ min: 0, max: 1440 })
    .withMessage('Minutes spent must be between 0 and 1440'),
  
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),
  
  validate
];
