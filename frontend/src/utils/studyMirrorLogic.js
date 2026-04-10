/**
 * Study Mirror Mode Logic
 * Compares user intention vs actual study behavior
 */

/**
 * Analyze intention vs behavior patterns for study data
 * @param {Array} entries - Study sessions and goals with intention and foundIt fields
 * @returns {Array} Array of mirror insights
 */
export const analyzeStudyMirrorPatterns = (entries) => {
  if (!entries || entries.length === 0) {
    return [];
  }

  const insights = [];
  
  // Check if this is fallback data (all entries have 'fallback' in id)
  const isFallbackData = entries.every(e => 
    e.id && e.id.toString().includes('fallback')
  );

  if (isFallbackData) {
    return [{
      type: 'no_data',
      message: 'Start your study journey! Begin with study sessions and create goals to see personalized insights about your learning patterns and study habits.',
      count: 0,
      percentage: 0
    }];
  }
  
  // Separate sessions and goals
  const sessions = entries.filter(e => e.type === 'session');
  const goals = entries.filter(e => e.type === 'goal');

  // Analyze session completion patterns
  const incompleteSessions = sessions.filter(s => !s.completed);
  const completedSessions = sessions.filter(s => s.completed);
  
  if (incompleteSessions.length > 0) {
    const incompletePercentage = (incompleteSessions.length / sessions.length) * 100;
    insights.push({
      type: 'incomplete_sessions',
      message: `You started ${incompleteSessions.length} study sessions but didn't complete them (${Math.round(incompletePercentage)}% of your sessions). Consider shorter sessions or better planning.`,
      count: incompleteSessions.length,
      percentage: incompletePercentage
    });
  }

  // Analyze goal completion patterns
  const incompleteGoals = goals.filter(g => !g.completed);
  const completedGoals = goals.filter(g => g.completed);
  
  if (incompleteGoals.length > 0) {
    const goalCompletionRate = (completedGoals.length / goals.length) * 100;
    insights.push({
      type: 'incomplete_goals',
      message: `You've completed ${completedGoals.length} out of ${goals.length} goals (${Math.round(goalCompletionRate)}% completion rate). Break down larger goals into smaller, manageable tasks.`,
      count: incompleteGoals.length,
      percentage: goalCompletionRate
    });
  }

  // Analyze study session duration patterns
  const sessionDurations = sessions.map(s => s.duration || 0);
  const avgDuration = sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length;
  
  if (avgDuration > 0 && avgDuration < 25) {
    insights.push({
      type: 'short_sessions',
      message: `Your average study session is ${Math.round(avgDuration)} minutes. Consider extending to 45-60 minutes for better retention and deeper learning.`,
      averageDuration: Math.round(avgDuration)
    });
  }

  // Analyze break patterns
  const totalBreaks = sessions.reduce((sum, s) => sum + (s.breaksTaken || 0), 0);
  const avgBreaksPerSession = sessions.length > 0 ? totalBreaks / sessions.length : 0;
  
  if (avgBreaksPerSession < 1 && sessions.length > 0) {
    insights.push({
      type: 'few_breaks',
      message: `You're taking only ${avgBreaksPerSession.toFixed(1)} breaks per session on average. Regular breaks every 45 minutes can improve focus and retention.`,
      averageBreaks: avgBreaksPerSession.toFixed(1)
    });
  }

  // Analyze study time patterns
  const sessionHours = sessions.map(s => new Date(s.startTime).getHours());
  const morningSessions = sessionHours.filter(h => h >= 6 && h < 12).length;
  const eveningSessions = sessionHours.filter(h => h >= 18).length;
  
  if (eveningSessions > morningSessions && sessions.length > 0) {
    insights.push({
      type: 'evening_studying',
      message: `You study more in the evening (${eveningSessions} sessions) than in the morning (${morningSessions} sessions). Try some morning sessions when your mind is fresh for better retention.`,
      eveningCount: eveningSessions,
      morningCount: morningSessions
    });
  }

  // Analyze goal deadline patterns
  const overdueGoals = goals.filter(g => {
    if (!g.deadline || g.completed) return false;
    return new Date(g.deadline) < new Date();
  });
  
  if (overdueGoals.length > 0) {
    insights.push({
      type: 'overdue_goals',
      message: `You have ${overdueGoals.length} overdue goals. Review your deadlines and consider adjusting your targets or study schedule.`,
      count: overdueGoals.length
    });
  }

  // Analyze subject consistency
  const subjectCounts = {};
  sessions.forEach(s => {
    const subject = s.intended || 'Unknown';
    subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
  });
  
  const mostStudiedSubject = Object.entries(subjectCounts).reduce((a, b) => 
    subjectCounts[a[0]] > subjectCounts[b[0]] ? a : b
  );
  
  if (Object.keys(subjectCounts).length > 1 && mostStudiedSubject[1] > sessions.length * 0.6) {
    insights.push({
      type: 'subject_imbalance',
      message: `You're spending ${Math.round((mostStudiedSubject[1] / sessions.length) * 100)}% of your time on ${mostStudiedSubject[0]}. Consider balancing with other subjects for comprehensive learning.`,
      subject: mostStudiedSubject[0],
      percentage: Math.round((mostStudiedSubject[1] / sessions.length) * 100)
    });
  }

  // Analyze study streak consistency
  const sessionDates = sessions.map(s => new Date(s.startTime).toDateString());
  const uniqueDates = [...new Set(sessionDates)];
  const studyDays = uniqueDates.length;
  const totalDays = sessions.length > 0 ? Math.ceil((new Date() - new Date(sessions[0].startTime)) / (1000 * 60 * 60 * 24)) : 0;
  
  if (totalDays > 7 && studyDays / totalDays < 0.5) {
    insights.push({
      type: 'inconsistent_schedule',
      message: `You've studied on ${studyDays} out of ${totalDays} days (${Math.round((studyDays / totalDays) * 100)}% consistency). Try to establish a more regular study routine.`,
      studyDays: studyDays,
      totalDays: totalDays,
      consistency: Math.round((studyDays / totalDays) * 100)
    });
  }

  return insights;
};
