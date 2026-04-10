import StudySession from '../models/StudySession.js';
import StudyGoal from '../models/StudyGoal.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { Op } from 'sequelize';

/**
 * @route   POST /api/study/sessions/start
 * @desc    Start a new study session
 * @access  Private
 */
export const startStudySession = asyncHandler(async (req, res) => {
  console.log('[Study Controller] Starting session for user:', req.user.id);
  console.log('[Study Controller] Request body:', req.body);
  
  const { subject, notes, tags } = req.body;
  const userId = req.user.id;

  // Check if there's already an active session
  const activeSession = await StudySession.findOne({
    where: {
      userId,
      endTime: null,
      isCompleted: false
    }
  });

  if (activeSession) {
    console.log('[Study Controller] User already has active session:', activeSession.id);
    return res.status(400).json({
      success: false,
      message: 'You already have an active study session. Please end it first.'
    });
  }

  const session = await StudySession.create({
    userId,
    subject: subject || 'General Study',
    notes: notes || '',
    tags: tags || [],
    startTime: new Date()
  });

  console.log('[Study Controller] Session created successfully:', session.id);
  
  res.status(201).json({
    success: true,
    data: session,
    message: 'Study session started successfully'
  });
});

/**
 * @route   POST /api/study/sessions/:sessionId/end
 * @desc    End a study session
 * @access  Private
 */
export const endStudySession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { productivity, notes } = req.body;
  const userId = req.user.id;

  const session = await StudySession.findOne({
    where: {
      id: sessionId,
      userId,
      endTime: null
    }
  });

  if (!session) {
    return res.status(404).json({
      success: false,
      message: 'Active study session not found'
    });
  }

  const endTime = new Date();
  const duration = Math.floor((endTime - session.startTime) / (1000 * 60));
  
  // Calculate focus score based on duration and interruptions
  let focusScore = 75;
  if (duration > 120) focusScore = 85;
  if (duration > 240) focusScore = 90;
  if (session.interruptions > 0) focusScore -= session.interruptions * 5;
  focusScore = Math.max(0, Math.min(100, focusScore));

  await session.update({
    endTime,
    duration,
    productivity: productivity || 'medium',
    notes: notes || session.notes,
    focusScore,
    isCompleted: true
  });

  res.json({
    success: true,
    data: session,
    message: 'Study session ended successfully'
  });
});

/**
 * @route   GET /api/study/sessions/active
 * @desc    Get active study session
 * @access  Private
 */
export const getActiveSession = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  console.log('[Study Controller] Getting active session for user:', userId);

  const activeSession = await StudySession.findOne({
    where: {
      userId,
      endTime: null,
      isCompleted: false
    }
  });

  console.log('[Study Controller] Active session found:', activeSession ? activeSession.id : 'None');

  res.json({
    success: true,
    data: activeSession
  });
});

/**
 * @route   GET /api/study/sessions
 * @desc    Get study sessions
 * @access  Private
 */
export const getStudySessions = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { startDate, endDate, limit = 50, offset = 0 } = req.query;

  const whereClause = { userId };
  
  if (startDate && endDate) {
    whereClause.startTime = {
      [Op.between]: [new Date(startDate), new Date(endDate)]
    };
  }

  const sessions = await StudySession.findAll({
    where: whereClause,
    order: [['startTime', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  res.json({
    success: true,
    data: {
      sessions,
      total: sessions.length
    }
  });
});

/**
 * @route   POST /api/study/goals
 * @desc    Create a new study goal
 * @access  Private
 */
export const createStudyGoal = asyncHandler(async (req, res) => {
  console.log('[Study Controller] Creating goal for user:', req.user.id);
  console.log('[Study Controller] Request body:', req.body);
  
  const { subject, targetHours, deadline, priority, color, description } = req.body;
  const userId = req.user.id;

  const goal = await StudyGoal.create({
    userId,
    subject,
    targetHours: parseFloat(targetHours),
    deadline: new Date(deadline),
    priority: priority || 'medium',
    color: color || '#3B82F6',
    description: description || ''
  });

  console.log('[Study Controller] Goal created successfully:', goal.id);
  
  res.status(201).json({
    success: true,
    data: goal,
    message: 'Study goal created successfully'
  });
});

/**
 * @route   GET /api/study/goals
 * @desc    Get study goals
 * @access  Private
 */
export const getStudyGoals = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { status, priority } = req.query;
  console.log('[Study Controller] Getting goals for user:', userId, 'filters:', { status, priority });

  const whereClause = { userId };
  if (status) whereClause.status = status;
  if (priority) whereClause.priority = priority;

  const goals = await StudyGoal.findAll({
    where: whereClause,
    order: [['deadline', 'ASC']]
  });

  console.log('[Study Controller] Found goals:', goals.length);

  res.json({
    success: true,
    data: goals
  });
});

/**
 * @route   PUT /api/study/goals/:goalId
 * @desc    Update a study goal
 * @access  Private
 */
export const updateStudyGoal = asyncHandler(async (req, res) => {
  const { goalId } = req.params;
  const userId = req.user.id;
  const updates = req.body;

  const goal = await StudyGoal.findOne({
    where: { id: goalId, userId }
  });

  if (!goal) {
    return res.status(404).json({
      success: false,
      message: 'Study goal not found'
    });
  }

  await goal.update(updates);

  res.json({
    success: true,
    data: goal,
    message: 'Study goal updated successfully'
  });
});

/**
 * @route   DELETE /api/study/goals/:goalId
 * @desc    Delete a study goal
 * @access  Private
 */
export const deleteStudyGoal = asyncHandler(async (req, res) => {
  const { goalId } = req.params;
  const userId = req.user.id;

  const goal = await StudyGoal.findOne({
    where: { id: goalId, userId }
  });

  if (!goal) {
    return res.status(404).json({
      success: false,
      message: 'Study goal not found'
    });
  }

  await goal.destroy();

  res.json({
    success: true,
    message: 'Study goal deleted successfully'
  });
});

/**
 * @route   GET /api/study/analytics
 * @desc    Get study analytics
 * @access  Private
 */
export const getStudyAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { period = 'week' } = req.query;

  // Calculate date range
  const now = new Date();
  let startDate;
  
  switch (period) {
    case 'day':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  // Get sessions and goals
  const [sessions, goals] = await Promise.all([
    StudySession.findAll({
      where: {
        userId,
        startTime: { [Op.gte]: startDate },
        isCompleted: true
      }
    }),
    StudyGoal.findAll({
      where: { userId }
    })
  ]);

  // Calculate analytics
  const totalMinutes = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
  const totalHours = totalMinutes / 60;
  const totalSessions = sessions.length;
  
  // Calculate study streak
  const sessionDates = [...new Set(sessions.map(s => s.startTime.toDateString()))].sort();
  let studyStreak = 0;
  const today = new Date().toDateString();
  
  for (let i = sessionDates.length - 1; i >= 0; i--) {
    const sessionDate = new Date(sessionDates[i]);
    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() - studyStreak);
    
    if (sessionDate.toDateString() === expectedDate.toDateString()) {
      studyStreak++;
    } else {
      break;
    }
  }

  // Calculate average focus score
  const averageFocusScore = sessions.length > 0
    ? Math.round(sessions.reduce((sum, session) => sum + (session.focusScore || 0), 0) / sessions.length)
    : 0;

  // Calculate goal completion rate
  const completedGoals = goals.filter(goal => goal.status === 'completed').length;
  const goalCompletionRate = goals.length > 0 ? Math.round((completedGoals / goals.length) * 100) : 0;

  res.json({
    success: true,
    data: {
      totalHours: Math.round(totalHours * 10) / 10,
      totalSessions,
      studyStreak,
      averageFocusScore,
      goalCompletionRate,
      activeGoals: goals.filter(goal => goal.status === 'active').length,
      completedGoals,
      overdueGoals: goals.filter(goal => goal.status === 'overdue').length
    }
  });
});
