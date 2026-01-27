import UsageLog from '../models/UsageLog.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { Op } from 'sequelize';

/**
 * @route   POST /api/usage
 * @desc    Create a new usage log entry
 * @access  Private
 */
export const createUsageLog = asyncHandler(async (req, res) => {
  const { appName, minutesSpent, date, intention, foundIt } = req.body;
  const userId = req.user.id;

  // Validate inputs
  if (!appName || !minutesSpent) {
    return res.status(400).json({
      success: false,
      message: 'App name and minutes spent are required'
    });
  }

  // Normalize date (use provided date or current date)
  const logDate = date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

  // Check for duplicate entry (case-insensitive app name)
  const existing = await UsageLog.findOne({
    where: {
      userId,
      appName: appName.trim(),
      date: logDate
    }
  });

  if (existing) {
    return res.status(400).json({
      success: false,
      message: `Usage entry for ${appName} already exists for this date. You can update it instead.`
    });
  }

  try {
    // Create usage log
    const usageLog = await UsageLog.create({
      userId,
      appName: appName.trim(),
      minutesSpent: parseFloat(minutesSpent),
      date: logDate,
      intention: intention ? intention.trim() : null,
      foundIt: foundIt !== undefined ? Boolean(foundIt) : null
    });

    res.status(201).json({
      success: true,
      message: 'Usage log created successfully',
      data: { usageLog }
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'A usage entry for this app and date already exists'
      });
    }
    throw error;
  }
});

/**
 * @route   GET /api/usage
 * @desc    Get all usage logs for current user (with optional filters)
 * @access  Private
 */
export const getUsageLogs = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { startDate, endDate, appName, limit = 100 } = req.query;

  // Build query
  const where = { userId };

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date[Op.gte] = startDate;
    if (endDate) where.date[Op.lte] = endDate;
  }

  if (appName) {
    where.appName = {
      [Op.like]: `%${appName}%`
    };
  }

  // Fetch logs
  const logs = await UsageLog.findAll({
    where,
    order: [['date', 'DESC'], ['createdAt', 'DESC']],
    limit: parseInt(limit)
  });

  res.json({
    success: true,
    data: {
      logs,
      count: logs.length
    }
  });
});

/**
 * @route   GET /api/usage/:id
 * @desc    Get a specific usage log by ID
 * @access  Private
 */
export const getUsageLogById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const usageLog = await UsageLog.findOne({
    where: { id, userId }
  });

  if (!usageLog) {
    return res.status(404).json({
      success: false,
      message: 'Usage log not found'
    });
  }

  res.json({
    success: true,
    data: { usageLog }
  });
});

/**
 * @route   PUT /api/usage/:id
 * @desc    Update a usage log
 * @access  Private
 */
export const updateUsageLog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { appName, minutesSpent, date, intention, foundIt } = req.body;

  // Find log and verify ownership
  const usageLog = await UsageLog.findOne({
    where: { id, userId }
  });

  if (!usageLog) {
    return res.status(404).json({
      success: false,
      message: 'Usage log not found'
    });
  }

  // Check for duplicate if appName or date is being changed
  if ((appName && appName !== usageLog.appName) || (date && date !== usageLog.date.toISOString().split('T')[0])) {
    const logDate = date ? new Date(date).toISOString().split('T')[0] : usageLog.date.toISOString().split('T')[0];

    const existing = await UsageLog.findOne({
      where: {
        userId,
        appName: appName || usageLog.appName,
        date: logDate,
        id: { [Op.ne]: id }
      }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A usage entry for this app and date already exists'
      });
    }
  }

  // Update fields
  if (appName) usageLog.appName = appName;
  if (minutesSpent !== undefined) usageLog.minutesSpent = parseFloat(minutesSpent);
  if (date) {
    usageLog.date = new Date(date).toISOString().split('T')[0];
  }
  if (intention !== undefined) usageLog.intention = intention ? intention.trim() : null;
  if (foundIt !== undefined) usageLog.foundIt = foundIt !== null ? Boolean(foundIt) : null;

  await usageLog.save();

  res.json({
    success: true,
    message: 'Usage log updated successfully',
    data: { usageLog }
  });
});

/**
 * @route   DELETE /api/usage/:id
 * @desc    Delete a usage log
 * @access  Private
 */
export const deleteUsageLog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const usageLog = await UsageLog.findOne({
    where: { id, userId }
  });

  if (!usageLog) {
    return res.status(404).json({
      success: false,
      message: 'Usage log not found'
    });
  }

  await usageLog.destroy();

  res.json({
    success: true,
    message: 'Usage log deleted successfully'
  });
});
