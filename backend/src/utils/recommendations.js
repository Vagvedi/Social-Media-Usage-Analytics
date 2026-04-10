/**
 * Recommendation Engine
 * Provides behavioral suggestions based on usage patterns
 * Uses non-judgmental, supportive tone
 */

/**
 * Generate personalized recommendations based on analytics
 * @param {Object} analytics - Analytics data (risk score, stats, trends)
 * @returns {Array} Array of recommendation objects
 */
export const generateRecommendations = (analytics) => {
  const recommendations = [];
  const { riskScore, weeklyStats, monthlyStats, peakMinutes } = analytics;

  // Recommendations based on risk level
  if (riskScore.level === 'high') {
    recommendations.push({
      type: 'usage',
      priority: 'high',
      title: 'Consider Setting Time Boundaries',
      message: 'Your usage patterns suggest frequent engagement. You might benefit from setting specific time limits or break reminders during your most active hours.',
      actionable: true
    });
    
    recommendations.push({
      type: 'awareness',
      priority: 'high',
      title: 'Track Your Peak Hours',
      message: `You're most active during peak usage periods. Being aware of these patterns can help you make more intentional choices about when to engage.`,
      actionable: false
    });
  }

  if (riskScore.level === 'moderate') {
    recommendations.push({
      type: 'balance',
      priority: 'medium',
      title: 'Maintain Healthy Balance',
      message: 'Your usage is moderate. Consider maintaining awareness and setting gentle reminders to ensure your engagement remains balanced with other activities.',
      actionable: true
    });
  }

  // Recommendations based on daily average
  if (weeklyStats.averageDailyMinutes > 240) {
    recommendations.push({
      type: 'break',
      priority: 'medium',
      title: 'Take Regular Breaks',
      message: 'Consider incorporating short breaks between sessions. Even 5-10 minute breaks can help refresh your focus.',
      actionable: true
    });
  }

  // Recommendations based on trend
  if (weeklyStats.trend === 'increasing') {
    recommendations.push({
      type: 'trend',
      priority: 'medium',
      title: 'Notice Usage Trends',
      message: 'Your usage has been increasing recently. This might be a good time to reflect on your goals and set some gentle boundaries if needed.',
      actionable: true
    });
  }

  if (weeklyStats.trend === 'decreasing') {
    recommendations.push({
      type: 'positive',
      priority: 'low',
      title: 'Great Progress!',
      message: 'You\'ve been reducing your usage recently. Keep up the awareness and continue making choices that align with your goals.',
      actionable: false
    });
  }

  // Recommendations based on consistency
  if (weeklyStats.daysActive === 7) {
    recommendations.push({
      type: 'variety',
      priority: 'medium',
      title: 'Diversify Your Activities',
      message: 'You engage daily. Consider exploring other activities or hobbies on some days to create variety in your routine.',
      actionable: true
    });
  }

  // Peak usage recommendations
  if (peakMinutes > 360) {
    recommendations.push({
      type: 'peak',
      priority: 'high',
      title: 'Manage High-Usage Days',
      message: 'Some days show particularly high usage. You might find it helpful to plan alternative activities for days when you notice you\'re spending extended time.',
      actionable: true
    });
  }

  // Default positive reinforcement if no specific recommendations
  if (recommendations.length === 0) {
    recommendations.push({
      type: 'general',
      priority: 'low',
      title: 'Stay Mindful',
      message: 'Regular tracking helps build awareness. Continue monitoring your patterns and make adjustments that feel right for you.',
      actionable: false
    });
  }

  return recommendations.slice(0, 5); // Limit to top 5 recommendations
};

/**
 * Get motivational message based on risk level
 * @param {String} level - Risk level (low, moderate, high)
 * @returns {String} Motivational message
 */
export const getMotivationalMessage = (level) => {
  const messages = {
    low: 'Your usage patterns are well-balanced. Keep up the great awareness!',
    moderate: 'You\'re maintaining moderate engagement. Continue being mindful of your patterns.',
    high: 'Your usage patterns show frequent engagement. Awareness is the first step toward intentional choices. You\'ve got this!'
  };

  return messages[level] || messages.low;
};
