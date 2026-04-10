// Study utilities and helper functions

export const studyUtils = {
  // Calculate study streak based on daily study sessions
  calculateStudyStreak(studySessions) {
    if (!studySessions || studySessions.length === 0) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sortedSessions = studySessions
      .map(session => new Date(session.date))
      .sort((a, b) => b - a);
    
    let streak = 0;
    let currentDate = new Date(today);
    
    for (const sessionDate of sortedSessions) {
      sessionDate.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((currentDate - sessionDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays === streak) {
        streak++;
        currentDate = new Date(sessionDate);
      } else if (diffDays > streak) {
        break;
      }
    }
    
    return streak;
  },

  // Calculate focus score based on study patterns
  calculateFocusScore(studySessions) {
    if (!studySessions || studySessions.length === 0) return 0;
    
    let score = 0;
    const factors = {
      consistency: 30,    // Study regularity
      duration: 25,       // Average session length
      timeOfDay: 20,      // Optimal study times
      interruptions: 25   // Session continuity
    };
    
    // Consistency: How many days studied in the last week
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const recentSessions = studySessions.filter(s => new Date(s.date) >= lastWeek);
    const uniqueDays = new Set(recentSessions.map(s => new Date(s.date).toDateString())).size;
    score += (uniqueDays / 7) * factors.consistency;
    
    // Duration: Average session length (optimal: 45-90 minutes)
    const avgDuration = studySessions.reduce((sum, s) => sum + s.duration, 0) / studySessions.length;
    if (avgDuration >= 45 && avgDuration <= 90) {
      score += factors.duration;
    } else if (avgDuration >= 30 && avgDuration <= 120) {
      score += factors.duration * 0.7;
    } else {
      score += factors.duration * 0.3;
    }
    
    // Time of day: Prefer morning/afternoon study
    const optimalHours = studySessions.filter(s => {
      const hour = new Date(s.date).getHours();
      return hour >= 9 && hour <= 17;
    });
    score += (optimalHours.length / studySessions.length) * factors.timeOfDay;
    
    // Interruptions: Based on session patterns (mock data for now)
    score += factors.interruptions * 0.8; // Assume good focus
    
    return Math.round(Math.min(100, score));
  },

  // Get study recommendations based on patterns
  getStudyRecommendations(studySessions, goals) {
    const recommendations = [];
    
    if (!studySessions || studySessions.length === 0) {
      recommendations.push({
        type: 'info',
        title: 'Start Your Journey',
        message: 'Begin tracking your study sessions to get personalized recommendations.',
        priority: 'high'
      });
      return recommendations;
    }
    
    const avgDailyHours = studySessions.reduce((sum, s) => sum + s.duration, 0) / studySessions.length / 60;
    const streak = this.calculateStudyStreak(studySessions);
    const focusScore = this.calculateFocusScore(studySessions);
    
    // Based on average daily study time
    if (avgDailyHours < 1) {
      recommendations.push({
        type: 'warning',
        title: 'Increase Study Time',
        message: 'Consider studying at least 1-2 hours daily for better retention.',
        priority: 'high'
      });
    } else if (avgDailyHours > 6) {
      recommendations.push({
        type: 'warning',
        title: 'Avoid Burnout',
        message: 'You\'re studying extensively. Consider taking regular breaks to maintain focus.',
        priority: 'medium'
      });
    }
    
    // Based on streak
    if (streak >= 7) {
      recommendations.push({
        type: 'success',
        title: 'Great Consistency!',
        message: `You've maintained a ${streak}-day study streak. Keep it up!`,
        priority: 'low'
      });
    } else if (streak === 0) {
      recommendations.push({
        type: 'info',
        title: 'Build a Routine',
        message: 'Try to study a little every day to build consistency.',
        priority: 'high'
      });
    }
    
    // Based on focus score
    if (focusScore < 50) {
      recommendations.push({
        type: 'warning',
        title: 'Improve Focus',
        message: 'Try the Pomodoro Technique: 25 minutes study, 5 minutes break.',
        priority: 'high'
      });
    }
    
    // Based on goals
    const overdueGoals = goals?.filter(goal => 
      new Date(goal.deadline) < new Date() && goal.currentHours < goal.targetHours
    ) || [];
    
    if (overdueGoals.length > 0) {
      recommendations.push({
        type: 'warning',
        title: 'Goal Deadline Approaching',
        message: `You have ${overdueGoals.length} goal(s) with upcoming deadlines. Prioritize these subjects.`,
        priority: 'high'
      });
    }
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  },

  // Format study duration in human-readable format
  formatDuration(minutes) {
    if (minutes < 60) {
      return `${minutes}m`;
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    } else {
      const days = Math.floor(minutes / 1440);
      const hours = Math.floor((minutes % 1440) / 60);
      return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
    }
  },

  // Get optimal study time recommendations
  getOptimalStudyTimes() {
    const now = new Date();
    const currentHour = now.getHours();
    
    if (currentHour >= 9 && currentHour <= 12) {
      return {
        message: "Perfect time for focused study! Morning hours are ideal for learning.",
        quality: "excellent",
        color: "green"
      };
    } else if (currentHour >= 14 && currentHour <= 17) {
      return {
        message: "Good afternoon study session. Your brain is still alert!",
        quality: "good",
        color: "blue"
      };
    } else if (currentHour >= 19 && currentHour <= 21) {
      return {
        message: "Evening review time. Good for lighter topics and revision.",
        quality: "fair",
        color: "yellow"
      };
    } else if (currentHour >= 22 || currentHour <= 6) {
      return {
        message: "Late night or early morning? Consider rest for better focus tomorrow.",
        quality: "poor",
        color: "red"
      };
    } else {
      return {
        message: "Lunch break time. Maybe a quick review session after eating?",
        quality: "fair",
        color: "yellow"
      };
    }
  },

  // Calculate study statistics for a given period
  calculateStudyStats(studySessions, period = 'week') {
    if (!studySessions || studySessions.length === 0) {
      return {
        totalHours: 0,
        averageDaily: 0,
        totalSessions: 0,
        averageSessionLength: 0,
        bestDay: null,
        subjectBreakdown: {}
      };
    }
    
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'day':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      default:
        startDate = new Date(0);
    }
    
    const periodSessions = studySessions.filter(s => new Date(s.date) >= startDate);
    
    const totalMinutes = periodSessions.reduce((sum, s) => sum + s.duration, 0);
    const totalHours = totalMinutes / 60;
    const totalSessions = periodSessions.length;
    const averageSessionLength = totalSessions > 0 ? totalMinutes / totalSessions : 0;
    
    // Calculate best day
    const dayGroups = periodSessions.reduce((groups, session) => {
      const day = new Date(session.date).toDateString();
      if (!groups[day]) groups[day] = 0;
      groups[day] += session.duration;
      return groups;
    }, {});
    
    const bestDay = Object.entries(dayGroups).reduce((best, [day, minutes]) => 
      minutes > (best?.minutes || 0) ? { day, minutes } : best
    , null);
    
    // Subject breakdown
    const subjectBreakdown = periodSessions.reduce((subjects, session) => {
      const subject = session.subject || 'General';
      if (!subjects[subject]) subjects[subject] = 0;
      subjects[subject] += session.duration;
      return subjects;
    }, {});
    
    const daysInPeriod = period === 'day' ? 1 : 
                        period === 'week' ? 7 : 
                        Math.ceil((now - startDate) / (1000 * 60 * 60 * 24));
    
    return {
      totalHours: Math.round(totalHours * 10) / 10,
      averageDaily: Math.round((totalHours / daysInPeriod) * 10) / 10,
      totalSessions,
      averageSessionLength: Math.round(averageSessionLength),
      bestDay: bestDay ? {
        day: new Date(bestDay.day).toLocaleDateString(),
        hours: Math.round((bestDay.minutes / 60) * 10) / 10
      } : null,
      subjectBreakdown: Object.fromEntries(
        Object.entries(subjectBreakdown).map(([subject, minutes]) => [
          subject, 
          Math.round((minutes / 60) * 10) / 10
        ])
      )
    };
  },

  // Generate study schedule suggestions
  generateStudySchedule(goals, availableHours = 4) {
    if (!goals || goals.length === 0) {
      return {
        schedule: [],
        message: "Add study goals to get a personalized schedule."
      };
    }
    
    // Sort goals by priority (deadline proximity and progress)
    const sortedGoals = [...goals].sort((a, b) => {
      const deadlineA = new Date(a.deadline);
      const deadlineB = new Date(b.deadline);
      const progressA = a.currentHours / a.targetHours;
      const progressB = b.currentHours / b.targetHours;
      
      // Prioritize overdue goals and those with less progress
      const priorityA = (deadlineA < new Date() ? 1000 : 0) + (1 - progressA) * 100;
      const priorityB = (deadlineB < new Date() ? 1000 : 0) + (1 - progressB) * 100;
      
      return priorityB - priorityA;
    });
    
    const schedule = [];
    let remainingHours = availableHours;
    
    for (const goal of sortedGoals) {
      if (remainingHours <= 0) break;
      
      const neededHours = goal.targetHours - goal.currentHours;
      const allocatedHours = Math.min(neededHours, remainingHours / sortedGoals.length);
      
      if (allocatedHours > 0) {
        schedule.push({
          subject: goal.subject,
          duration: Math.round(allocatedHours * 10) / 10,
          priority: neededHours > 0 ? 'high' : 'medium',
          reason: neededHours > 0 ? 
            `${neededHours.toFixed(1)}h needed to reach goal` : 
            'Review and巩固'
        });
        remainingHours -= allocatedHours;
      }
    }
    
    if (remainingHours > 0) {
      schedule.push({
        subject: 'Review/Break',
        duration: remainingHours,
        priority: 'low',
        reason: 'Flexible time for review or break'
      });
    }
    
    return {
      schedule,
      message: schedule.length > 0 ? 
        "Here's your personalized study schedule for today:" :
        "Great job! All goals are on track."
    };
  }
};
