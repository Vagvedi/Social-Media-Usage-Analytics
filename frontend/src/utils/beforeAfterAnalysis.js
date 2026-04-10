/**
 * Before vs After Tracking Analysis
 * Compares first N days vs most recent N days
 */

/**
 * Calculate before vs after comparison
 * @param {Array} entries - All usage entries sorted by date
 * @param {number} daysToCompare - Number of days to compare (default: 7)
 * @returns {Object} Comparison data
 */
export const calculateBeforeAfter = (entries, daysToCompare = 7) => {
  if (!entries || entries.length === 0) {
    return null;
  }

  // Sort entries by date
  const sortedEntries = [...entries].sort((a, b) => {
    return new Date(a.date) - new Date(b.date);
  });

  // Get first N days
  const firstDate = new Date(sortedEntries[0].date);
  const firstNDays = sortedEntries.filter(entry => {
    const entryDate = new Date(entry.date);
    const daysDiff = Math.floor((entryDate - firstDate) / (1000 * 60 * 60 * 24));
    return daysDiff < daysToCompare;
  });

  // Get last N days
  const lastDate = new Date(sortedEntries[sortedEntries.length - 1].date);
  const lastNDays = sortedEntries.filter(entry => {
    const entryDate = new Date(entry.date);
    const daysDiff = Math.floor((lastDate - entryDate) / (1000 * 60 * 60 * 24));
    return daysDiff < daysToCompare;
  });

  if (firstNDays.length === 0 || lastNDays.length === 0) {
    return null;
  }

  // Calculate metrics for "before" period
  const beforeMetrics = calculateMetrics(firstNDays);

  // Calculate metrics for "after" period
  const afterMetrics = calculateMetrics(lastNDays);

  // Calculate changes
  const changes = {
    dailyUsage: afterMetrics.avgDailyMinutes - beforeMetrics.avgDailyMinutes,
    lateNightUsage: afterMetrics.lateNightFrequency - beforeMetrics.lateNightFrequency,
    riskScore: afterMetrics.riskScore - beforeMetrics.riskScore,
    honestyScore: afterMetrics.honestyScore - beforeMetrics.honestyScore
  };

  return {
    before: beforeMetrics,
    after: afterMetrics,
    changes,
    daysCompared: daysToCompare
  };
};

/**
 * Calculate metrics for a set of entries
 */
const calculateMetrics = (entries) => {
  if (!entries || entries.length === 0) {
    return {
      avgDailyMinutes: 0,
      lateNightFrequency: 0,
      riskScore: 0,
      honestyScore: 100,
      totalMinutes: 0,
      daysActive: 0
    };
  }

  // Group by date
  const dateMap = new Map();
  entries.forEach(entry => {
    const dateKey = entry.date;
    if (!dateMap.has(dateKey)) {
      dateMap.set(dateKey, []);
    }
    dateMap.get(dateKey).push(entry);
  });

  // Calculate daily averages
  const dailyTotals = Array.from(dateMap.values()).map(dayEntries => {
    return dayEntries.reduce((sum, e) => sum + parseFloat(e.minutesSpent || 0), 0);
  });

  const totalMinutes = dailyTotals.reduce((sum, val) => sum + val, 0);
  const avgDailyMinutes = totalMinutes / dateMap.size;
  const daysActive = dateMap.size;

  // Calculate late-night frequency (after 10 PM or before 6 AM)
  // Use createdAt timestamp if available
  let lateNightCount = 0;
  entries.forEach(entry => {
    if (entry.createdAt) {
      const date = new Date(entry.createdAt);
      const hour = date.getHours();
      if (hour >= 22 || hour < 6) {
        lateNightCount++;
      }
    }
  });
  const lateNightFrequency = entries.length > 0 ? lateNightCount / entries.length : 0;

  // Calculate risk score (simplified version)
  let riskScore = 0;
  if (avgDailyMinutes >= 360) riskScore = 80;
  else if (avgDailyMinutes >= 240) riskScore = 60;
  else if (avgDailyMinutes >= 120) riskScore = 40;
  else if (avgDailyMinutes >= 60) riskScore = 20;
  else riskScore = 10;

  // Add points for consistency (using app many days)
  const consistencyPoints = (daysActive / 7) * 20;
  riskScore = Math.min(100, riskScore + consistencyPoints);

  // Calculate honesty score (simplified)
  let honestyScore = 100;
  
  // Check for gaps
  const dates = Array.from(dateMap.keys()).sort();
  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(dates[i - 1]);
    const currDate = new Date(dates[i]);
    const daysDiff = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
    if (daysDiff > 7) {
      honestyScore -= Math.min(30, (daysDiff - 7) * 5);
    }
  }

  // Check for unrealistic values
  entries.forEach(entry => {
    const minutes = parseFloat(entry.minutesSpent || 0);
    if (minutes > 960) { // >16 hours
      honestyScore -= 10;
    }
  });

  honestyScore = Math.max(0, Math.min(100, honestyScore));

  return {
    avgDailyMinutes: Math.round(avgDailyMinutes * 100) / 100,
    lateNightFrequency: Math.round(lateNightFrequency * 100) / 100,
    riskScore: Math.round(riskScore),
    honestyScore: Math.round(honestyScore),
    totalMinutes: Math.round(totalMinutes * 100) / 100,
    daysActive
  };
};
