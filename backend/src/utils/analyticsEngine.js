/**
 * Analytics Engine
 * Calculates usage statistics, trends, and addiction risk scores
 * 
 * RISK SCORING CRITERIA (Behavioral Indicators Only):
 * - Daily average usage
 * - Weekly consistency
 * - Peak usage days
 * - Trend direction (increasing/decreasing)
 */

/**
 * Calculate daily usage statistics
 * @param {Array} logs - Array of usage logs
 * @returns {Object} Daily statistics
 */
export const calculateDailyStats = (logs) => {
  if (!logs || logs.length === 0) {
    return {
      totalMinutes: 0,
      averageMinutes: 0,
      appCount: 0,
      apps: []
    };
  }

  const totalMinutes = logs.reduce((sum, log) => sum + log.minutesSpent, 0);
  const averageMinutes = totalMinutes / logs.length;
  
  // Group by app
  const appMap = new Map();
  logs.forEach(log => {
    const existing = appMap.get(log.appName) || 0;
    appMap.set(log.appName, existing + log.minutesSpent);
  });

  const apps = Array.from(appMap.entries())
    .map(([name, minutes]) => ({ name, minutes }))
    .sort((a, b) => b.minutes - a.minutes);

  return {
    totalMinutes: Math.round(totalMinutes * 100) / 100,
    averageMinutes: Math.round(averageMinutes * 100) / 100,
    appCount: appMap.size,
    apps
  };
};

/**
 * Calculate weekly usage statistics
 * @param {Array} logs - Array of usage logs from last 7 days
 * @returns {Object} Weekly statistics
 */
export const calculateWeeklyStats = (logs) => {
  if (!logs || logs.length === 0) {
    return {
      totalMinutes: 0,
      averageDailyMinutes: 0,
      daysActive: 0,
      trend: 'stable',
      apps: []
    };
  }

  // Group by date
  const dateMap = new Map();
  logs.forEach(log => {
    const dateKey = log.date.toISOString().split('T')[0];
    const existing = dateMap.get(dateKey) || 0;
    dateMap.set(dateKey, existing + log.minutesSpent);
  });

  const dailyTotals = Array.from(dateMap.values());
  const totalMinutes = dailyTotals.reduce((sum, val) => sum + val, 0);
  const averageDailyMinutes = totalMinutes / Math.max(1, dateMap.size);
  const daysActive = dateMap.size;

  // Calculate trend (compare first half vs second half of week)
  let trend = 'stable';
  if (dailyTotals.length >= 4) {
    const midpoint = Math.floor(dailyTotals.length / 2);
    const firstHalf = dailyTotals.slice(0, midpoint).reduce((a, b) => a + b, 0) / midpoint;
    const secondHalf = dailyTotals.slice(midpoint).reduce((a, b) => a + b, 0) / (dailyTotals.length - midpoint);
    
    if (secondHalf > firstHalf * 1.1) trend = 'increasing';
    else if (secondHalf < firstHalf * 0.9) trend = 'decreasing';
  }

  // Group by app for top apps
  const appMap = new Map();
  logs.forEach(log => {
    const existing = appMap.get(log.appName) || 0;
    appMap.set(log.appName, existing + log.minutesSpent);
  });

  const apps = Array.from(appMap.entries())
    .map(([name, minutes]) => ({ name, minutes }))
    .sort((a, b) => b.minutes - a.minutes);

  return {
    totalMinutes: Math.round(totalMinutes * 100) / 100,
    averageDailyMinutes: Math.round(averageDailyMinutes * 100) / 100,
    daysActive,
    trend,
    apps
  };
};

/**
 * Calculate monthly usage statistics
 * @param {Array} logs - Array of usage logs from last 30 days
 * @returns {Object} Monthly statistics
 */
export const calculateMonthlyStats = (logs) => {
  if (!logs || logs.length === 0) {
    return {
      totalMinutes: 0,
      averageDailyMinutes: 0,
      daysActive: 0
    };
  }

  const dateMap = new Map();
  logs.forEach(log => {
    const dateKey = log.date.toISOString().split('T')[0];
    const existing = dateMap.get(dateKey) || 0;
    dateMap.set(dateKey, existing + log.minutesSpent);
  });

  const dailyTotals = Array.from(dateMap.values());
  const totalMinutes = dailyTotals.reduce((sum, val) => sum + val, 0);
  const averageDailyMinutes = totalMinutes / Math.max(1, dateMap.size);

  return {
    totalMinutes: Math.round(totalMinutes * 100) / 100,
    averageDailyMinutes: Math.round(averageDailyMinutes * 100) / 100,
    daysActive: dateMap.size
  };
};

/**
 * Calculate addiction risk score (0-100)
 * This is a BEHAVIORAL INDICATOR, not a medical diagnosis
 * 
 * Scoring factors:
 * - Average daily usage (weight: 40%)
 * - Peak usage day (weight: 20%)
 * - Consistency (daily usage) (weight: 20%)
 * - Trend (increasing usage) (weight: 20%)
 * 
 * @param {Array} weeklyLogs - Last 7 days of logs
 * @param {Array} monthlyLogs - Last 30 days of logs
 * @returns {Object} Risk score and category
 */
export const calculateRiskScore = (weeklyLogs, monthlyLogs) => {
  if (!weeklyLogs || weeklyLogs.length === 0) {
    return {
      score: 0,
      category: 'Low',
      level: 'low'
    };
  }

  let score = 0;

  // Factor 1: Average daily usage (40 points)
  const weeklyStats = calculateWeeklyStats(weeklyLogs);
  const avgDaily = weeklyStats.averageDailyMinutes;
  
  // Score based on daily average:
  // < 60 min: 0-10 points
  // 60-120 min: 10-20 points
  // 120-240 min: 20-30 points
  // 240-360 min: 30-35 points
  // > 360 min: 35-40 points
  if (avgDaily >= 360) score += 40;
  else if (avgDaily >= 240) score += 30 + ((avgDaily - 240) / 120) * 5;
  else if (avgDaily >= 120) score += 20 + ((avgDaily - 120) / 120) * 10;
  else if (avgDaily >= 60) score += 10 + ((avgDaily - 60) / 60) * 10;
  else score += (avgDaily / 60) * 10;

  // Factor 2: Peak usage day (20 points)
  const dateMap = new Map();
  weeklyLogs.forEach(log => {
    const dateKey = log.date.toISOString().split('T')[0];
    const existing = dateMap.get(dateKey) || 0;
    dateMap.set(dateKey, existing + log.minutesSpent);
  });
  const peakMinutes = Math.max(...Array.from(dateMap.values()), 0);
  
  // Score based on peak day:
  // < 120 min: 0-5 points
  // 120-240 min: 5-10 points
  // 240-360 min: 10-15 points
  // > 360 min: 15-20 points
  if (peakMinutes >= 360) score += 20;
  else if (peakMinutes >= 240) score += 15 + ((peakMinutes - 240) / 120) * 5;
  else if (peakMinutes >= 120) score += 10 + ((peakMinutes - 120) / 120) * 5;
  else score += (peakMinutes / 120) * 5;

  // Factor 3: Consistency - daily usage (20 points)
  const daysActive = weeklyStats.daysActive;
  // Using app 7 days = 20 points, fewer days = fewer points
  score += (daysActive / 7) * 20;

  // Factor 4: Trend - increasing usage (20 points)
  if (weeklyStats.trend === 'increasing') score += 20;
  else if (weeklyStats.trend === 'stable') score += 10;
  else score += 5; // decreasing

  // Clamp score to 0-100
  score = Math.max(0, Math.min(100, Math.round(score)));

  // Categorize
  let category = 'Low';
  let level = 'low';
  
  if (score >= 70) {
    category = 'High';
    level = 'high';
  } else if (score >= 40) {
    category = 'Moderate';
    level = 'moderate';
  }

  return {
    score,
    category,
    level
  };
};

/**
 * Get time-based aggregations for charts
 * @param {Array} logs - Usage logs
 * @param {String} period - 'daily', 'weekly', 'monthly'
 * @returns {Array} Aggregated data points
 */
export const getTimeSeriesData = (logs, period = 'daily') => {
  if (!logs || logs.length === 0) return [];

  const dateMap = new Map();
  
  logs.forEach(log => {
    let key;
    const date = new Date(log.date);
    
    if (period === 'daily') {
      key = date.toISOString().split('T')[0];
    } else if (period === 'weekly') {
      // Group by week (Monday as start)
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay() + 1);
      key = weekStart.toISOString().split('T')[0];
    } else {
      // Monthly
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }
    
    const existing = dateMap.get(key) || 0;
    dateMap.set(key, existing + log.minutesSpent);
  });

  return Array.from(dateMap.entries())
    .map(([date, minutes]) => ({
      date,
      minutes: Math.round(minutes * 100) / 100
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
};
