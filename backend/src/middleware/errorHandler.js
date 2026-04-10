/**
 * Global error handler middleware
 * Handles all errors and sends appropriate responses
 * ALWAYS returns JSON, never throws uncaught errors
 */
export const errorHandler = (err, req, res, next) => {
  console.error('[Error Handler] Error caught:', {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    const errors = err.errors?.map(e => e.message) || [err.message];
    message = `Validation error: ${errors.join(', ')}`;
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    const field = err.errors?.[0]?.path || 'field';
    message = `${field} already exists. Please choose a different ${field}.`;
  }

  // Sequelize database error
  if (err.name === 'SequelizeDatabaseError') {
    statusCode = 400;
    message = 'Database error occurred. Please try again.';
  }

  // Sequelize connection error
  if (err.name === 'SequelizeConnectionError') {
    statusCode = 503;
    message = 'Database connection error. Please try again later.';
  }

  // Sequelize foreign key constraint error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    message = 'Invalid reference';
  }

  // Sequelize cast/parse error
  if (err.name === 'SequelizeCastError' || err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource ID';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Ensure response is sent
  if (!res.headersSent) {
    try {
      res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { 
          stack: err.stack,
          error: err.name 
        })
      });
    } catch (responseError) {
      console.error('[Error Handler] Failed to send error response:', responseError);
      // Last resort: try to send a plain text response
      if (!res.headersSent) {
        res.status(statusCode).end(message);
      }
    }
  }
};

/**
 * Async handler wrapper
 * Catches errors from async route handlers
 * Ensures all errors are passed to errorHandler middleware
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((error) => {
    console.error('[Async Handler] Unhandled error in async route:', error);
    next(error);
  });
};
