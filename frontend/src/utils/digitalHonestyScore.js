/**
 * Calculates the Digital Honesty Score based on usage entry patterns
 * @param {Array} entries - Array of usage entries with { appName, minutesSpent, date }
 * @returns {number} Score between 0-100
 */
export const calculateDigitalHonestyScore = (entries) => {
  if (!entries || entries.length === 0) {
    return 100; // Perfect score for no entries (nothing to be dishonest about)
  }

  if (entries.length === 1) {
    return 100; // Single entry gets full score
  }

  // Sort entries by date
  const sortedEntries = [...entries].sort((a, b) => {
    return new Date(a.date) - new Date(b.date);
  });

  let score = 100;

  // 1. Check for large gaps between logged dates
  const maxGapDays = 7; // Penalize gaps larger than 7 days
  for (let i = 1; i < sortedEntries.length; i++) {
    const prevDate = new Date(sortedEntries[i - 1].date);
    const currDate = new Date(sortedEntries[i].date);
    const daysDiff = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > maxGapDays) {
      // Penalty: -5 points per day over maxGapDays, max -30 points
      const penalty = Math.min(30, (daysDiff - maxGapDays) * 5);
      score -= penalty;
    }
  }

  // 2. Check for unrealistic values (>16 hours = 960 minutes in a day)
  const maxRealisticMinutes = 960; // 16 hours
  for (const entry of sortedEntries) {
    const minutes = parseFloat(entry.minutesSpent) || 0;
    if (minutes > maxRealisticMinutes) {
      // Penalty: -10 points for each unrealistic entry, max -40 points
      score -= 10;
    }
  }

  // 3. Check for sudden extreme spikes compared to recent entries
  // Calculate average of last 3 entries (if available) and compare current
  if (sortedEntries.length >= 4) {
    for (let i = 3; i < sortedEntries.length; i++) {
      const recentEntries = sortedEntries.slice(i - 3, i);
      const recentAvg = recentEntries.reduce((sum, e) => sum + (parseFloat(e.minutesSpent) || 0), 0) / recentEntries.length;
      const currentMinutes = parseFloat(sortedEntries[i].minutesSpent) || 0;
      
      // If current is more than 3x the recent average, it's a spike
      if (recentAvg > 0 && currentMinutes > recentAvg * 3) {
        // Penalty: -5 points per spike, max -25 points
        score -= 5;
      }
    }
  } else if (sortedEntries.length >= 2) {
    // For shorter histories, compare consecutive entries
    for (let i = 1; i < sortedEntries.length; i++) {
      const prevMinutes = parseFloat(sortedEntries[i - 1].minutesSpent) || 0;
      const currentMinutes = parseFloat(sortedEntries[i].minutesSpent) || 0;
      
      // If current is more than 5x the previous, it's a spike
      if (prevMinutes > 0 && currentMinutes > prevMinutes * 5) {
        score -= 5;
      }
    }
  }

  // Clamp score between 0 and 100
  return Math.max(0, Math.min(100, Math.round(score)));
};
