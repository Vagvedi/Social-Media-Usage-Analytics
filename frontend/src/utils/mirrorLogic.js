/**
 * Digital Mirror Mode Logic
 * Compares user intention vs actual usage behavior
 */

/**
 * Analyze intention vs behavior patterns
 * @param {Array} entries - Usage entries with intention and foundIt fields
 * @returns {Array} Array of mirror insights
 */
export const analyzeMirrorPatterns = (entries) => {
  if (!entries || entries.length === 0) {
    return [];
  }

  const insights = [];
  const entriesWithIntention = entries.filter(e => e.intention && e.foundIt !== null);

  if (entriesWithIntention.length === 0) {
    return [];
  }

  // Group by intention
  const intentionGroups = new Map();
  entriesWithIntention.forEach(entry => {
    const intention = entry.intention.toLowerCase();
    if (!intentionGroups.has(intention)) {
      intentionGroups.set(intention, []);
    }
    intentionGroups.get(intention).push(entry);
  });

  // Analyze each intention group
  intentionGroups.forEach((groupEntries, intention) => {
    const totalCount = groupEntries.length;
    const foundItCount = groupEntries.filter(e => e.foundIt === true).length;
    const notFoundCount = groupEntries.filter(e => e.foundIt === false).length;
    const foundItRate = foundItCount / totalCount;

    // Calculate average session duration for this intention
    const avgMinutes = groupEntries.reduce((sum, e) => sum + parseFloat(e.minutesSpent || 0), 0) / totalCount;

    // Check for late-night usage (after 10 PM)
    // Use createdAt timestamp if available, otherwise skip
    const lateNightCount = groupEntries.filter(entry => {
      if (entry.createdAt) {
        const date = new Date(entry.createdAt);
        const hour = date.getHours();
        return hour >= 22 || hour < 6; // 10 PM to 6 AM
      }
      return false;
    }).length;

    // Check for repeated opens (same app, same day, multiple times)
    const sameDayEntries = new Map();
    groupEntries.forEach(entry => {
      const dateKey = entry.date;
      if (!sameDayEntries.has(dateKey)) {
        sameDayEntries.set(dateKey, []);
      }
      sameDayEntries.get(dateKey).push(entry);
    });
    const repeatedOpens = Array.from(sameDayEntries.values()).filter(dayEntries => dayEntries.length > 1).length;

    // Generate insight if pattern detected
    if (foundItRate < 0.5 && totalCount >= 3) {
      // User didn't find what they were looking for most of the time
      const intentionText = capitalizeFirst(intention);
      insights.push({
        intention: intentionText,
        pattern: 'not_found',
        count: totalCount,
        foundItRate,
        avgMinutes: Math.round(avgMinutes),
        lateNightCount,
        repeatedOpens,
        message: `You opened apps to ${intentionText.toLowerCase()}. You didn't find it ${notFoundCount} out of ${totalCount} times. This pattern occurred ${totalCount} times.`
      });
    } else if (avgMinutes > 60 && foundItRate < 0.7) {
      // Long sessions but didn't find what they wanted
      const intentionText = capitalizeFirst(intention);
      insights.push({
        intention: intentionText,
        pattern: 'long_session_not_found',
        count: totalCount,
        foundItRate,
        avgMinutes: Math.round(avgMinutes),
        lateNightCount,
        repeatedOpens,
        message: `You opened apps to ${intentionText.toLowerCase()}. You spent an average of ${Math.round(avgMinutes)} minutes but only found what you were looking for ${Math.round(foundItRate * 100)}% of the time.`
      });
    } else if (lateNightCount > 0 && lateNightCount / totalCount > 0.4) {
      // Late night usage pattern
      const intentionText = capitalizeFirst(intention);
      insights.push({
        intention: intentionText,
        pattern: 'late_night',
        count: totalCount,
        foundItRate,
        avgMinutes: Math.round(avgMinutes),
        lateNightCount,
        repeatedOpens,
        message: `You opened apps to ${intentionText.toLowerCase()} ${lateNightCount} times late at night. You closed them feeling ${foundItRate < 0.5 ? 'more tired' : 'unsatisfied'}. This pattern occurred ${totalCount} times this week.`
      });
    }
  });

  return insights.sort((a, b) => b.count - a.count);
};

/**
 * Capitalize first letter
 */
const capitalizeFirst = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
