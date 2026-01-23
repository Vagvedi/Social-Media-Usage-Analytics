import UsageLog from '../models/UsageLog.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { Op, fn, col, literal } from 'sequelize';
import {
  calculateDailyStats,
  calculateWeeklyStats,
  calculateMonthlyStats,
  calculateRiskScore,
  getTimeSeriesData
} from '../utils/analyticsEngine.js';
import {
  generateRecommendations,
  getMotivationalMessage
} from '../utils/recommendations.js';

/**
 * @route   GET /api/analytics/dashboard
 * @desc    Get comprehensive dashboard analytics
 * @access  Private
 */
export const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Convert dates to strings for Sequelize
  const todayStr = today.toISOString().split('T')[0];
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

  // Fetch logs for different periods
  const [todayLogs, weeklyLogs, monthlyLogs, allRecentLogs] = await Promise.all([
    UsageLog.findAll({
      where: {
        userId,
        date: { [Op.gte]: todayStr }
      }
    }),
    UsageLog.findAll({
      where: {
        userId,
        date: { [Op.gte]: sevenDaysAgoStr }
      }
    }),
    UsageLog.findAll({
      where: {
        userId,
        date: { [Op.gte]: thirtyDaysAgoStr }
      }
    }),
    UsageLog.findAll({
      where: {
        userId,
        date: { [Op.gte]: thirtyDaysAgoStr }
      },
      order: [['date', 'DESC']],
      limit: 100
    })
  ]);

  // Convert Sequelize instances to plain objects for analytics engine
  const convertToPlain = (logs) => logs.map(log => ({
    appName: log.appName,
    minutesSpent: parseFloat(log.minutesSpent),
    date: new Date(log.date)
  }));

  // Calculate statistics
  const dailyStats = calculateDailyStats(convertToPlain(todayLogs));
  const weeklyStats = calculateWeeklyStats(convertToPlain(weeklyLogs));
  const monthlyStats = calculateMonthlyStats(convertToPlain(monthlyLogs));

  // Calculate peak minutes for the week
  const dateMap = new Map();
  convertToPlain(weeklyLogs).forEach(log => {
    const dateKey = log.date.toISOString().split('T')[0];
    const existing = dateMap.get(dateKey) || 0;
    dateMap.set(dateKey, existing + log.minutesSpent);
  });
  const peakMinutes = Math.max(...Array.from(dateMap.values()), 0);

  // Calculate risk score
  const riskScore = calculateRiskScore(convertToPlain(weeklyLogs), convertToPlain(monthlyLogs));

  // Get recommendations
  const recommendations = generateRecommendations({
    riskScore,
    weeklyStats,
    monthlyStats,
    peakMinutes
  });

  // Get time series data for charts
  const dailyTimeSeries = getTimeSeriesData(convertToPlain(weeklyLogs), 'daily');
  const weeklyTimeSeries = getTimeSeriesData(convertToPlain(monthlyLogs), 'weekly');

  res.json({
    success: true,
    data: {
      daily: dailyStats,
      weekly: weeklyStats,
      monthly: monthlyStats,
      riskScore: {
        ...riskScore,
        message: getMotivationalMessage(riskScore.level)
      },
      topApps: weeklyStats.apps?.slice(0, 5).map(app => ({
        name: app.name,
        minutes: app.minutes
      })) || [],
      recommendations,
      charts: {
        daily: dailyTimeSeries,
        weekly: weeklyTimeSeries
      }
    }
  });
});

/**
 * @route   GET /api/analytics/stats
 * @desc    Get usage statistics for a custom date range
 * @access  Private
 */
export const getStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { startDate, endDate, period = 'daily' } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: 'startDate and endDate are required'
    });
  }

  const start = new Date(startDate).toISOString().split('T')[0];
  const end = new Date(endDate).toISOString().split('T')[0];

  // Fetch logs
  const logs = await UsageLog.findAll({
    where: {
      userId,
      date: { [Op.between]: [start, end] }
    },
    order: [['date', 'DESC']]
  });

  // Convert to plain objects
  const plainLogs = logs.map(log => ({
    appName: log.appName,
    minutesSpent: parseFloat(log.minutesSpent),
    date: new Date(log.date)
  }));

  // Calculate stats based on period
  let stats;
  if (period === 'daily') {
    stats = calculateDailyStats(plainLogs);
  } else if (period === 'weekly') {
    stats = calculateWeeklyStats(plainLogs);
  } else {
    stats = calculateMonthlyStats(plainLogs);
  }

  // Get time series data
  const timeSeries = getTimeSeriesData(plainLogs, period);

  res.json({
    success: true,
    data: {
      stats,
      timeSeries,
      period
    }
  });
});

/**
 * @route   GET /api/analytics/risk-score
 * @desc    Get current addiction risk score
 * @access  Private
 */
export const getRiskScore = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

  const [weeklyLogs, monthlyLogs] = await Promise.all([
    UsageLog.findAll({
      where: {
        userId,
        date: { [Op.gte]: sevenDaysAgoStr }
      }
    }),
    UsageLog.findAll({
      where: {
        userId,
        date: { [Op.gte]: thirtyDaysAgoStr }
      }
    })
  ]);

  // Convert to plain objects
  const convertToPlain = (logs) => logs.map(log => ({
    appName: log.appName,
    minutesSpent: parseFloat(log.minutesSpent),
    date: new Date(log.date)
  }));

  const riskScore = calculateRiskScore(convertToPlain(weeklyLogs), convertToPlain(monthlyLogs));

  res.json({
    success: true,
    data: {
      riskScore: {
        ...riskScore,
        message: getMotivationalMessage(riskScore.level)
      }
    }
  });
});
