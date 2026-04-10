import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/authRoutes.js';
import usageRoutes from './routes/usageRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import studyRoutes from './routes/studyRoutes.js';

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Social Media Analytics API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/usage', usageRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/study', studyRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to MySQL Database
    await connectDB();
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
