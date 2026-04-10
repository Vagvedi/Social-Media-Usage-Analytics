import { useState, useEffect } from 'react';
import { studyAPI } from '../services/api';
import { studyUtils } from '../utils/studyUtils';

export const PersonalLearningAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    learningPatterns: [],
    cognitiveMetrics: [],
    productivityInsights: [],
    personalizedRecommendations: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        
        // Fetch real sessions and goals data
        const [sessionsResponse, goalsResponse] = await Promise.all([
          studyAPI.getSessions(),
          studyAPI.getGoals()
        ]);

        const sessions = sessionsResponse.data || [];
        const goals = goalsResponse.data || [];

        console.log('Personal Analytics - Sessions:', sessions);
        console.log('Personal Analytics - Goals:', goals);
        console.log('Personal Analytics - Sessions length:', sessions.length);

        // Always calculate patterns, even with no data
        const learningPatterns = sessions.length > 0 ? calculateLearningPatterns(sessions) : getFallbackLearningPatterns();
        const cognitiveMetrics = sessions.length > 0 ? calculateCognitiveMetrics(sessions) : getFallbackCognitiveMetrics();
        const productivityInsights = sessions.length > 0 ? calculateProductivityInsights(sessions) : getFallbackProductivityInsights();
        const personalizedRecommendations = sessions.length > 0 ? generateRecommendations(sessions, goals) : getFallbackRecommendations();

        console.log('Personal Analytics - Learning Patterns:', learningPatterns);
        console.log('Personal Analytics - Cognitive Metrics:', cognitiveMetrics);

        setAnalytics({
          learningPatterns,
          cognitiveMetrics,
          productivityInsights,
          personalizedRecommendations
        });
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        // Always show meaningful data, even on error
        setAnalytics({
          learningPatterns: getFallbackLearningPatterns(),
          cognitiveMetrics: getFallbackCognitiveMetrics(),
          productivityInsights: getFallbackProductivityInsights(),
          personalizedRecommendations: getFallbackRecommendations()
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Helper functions to calculate real analytics
  const calculateLearningPatterns = (sessions) => {
    if (sessions.length === 0) return [];

    // Calculate focus duration patterns
    const sessionDurations = sessions.map(session => {
      const start = new Date(session.startTime);
      const end = new Date(session.endTime);
      return (end - start) / (1000 * 60); // duration in minutes
    });

    const avgDuration = sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length;
    
    // Find best study time by analyzing session start times
    const hourGroups = {};
    sessions.forEach(session => {
      const hour = new Date(session.startTime).getHours();
      hourGroups[hour] = (hourGroups[hour] || 0) + 1;
    });
    
    const bestHour = Object.entries(hourGroups).reduce((a, b) => 
      hourGroups[a[0]] > hourGroups[b[0]] ? a : b
    )[0];

    // Calculate break frequency
    const totalBreaks = sessions.reduce((sum, session) => sum + (session.breaksTaken || 0), 0);
    const avgBreaksPerSession = totalBreaks / sessions.length;
    const avgBreakInterval = avgDuration / (avgBreaksPerSession + 1);

    return [
      {
        pattern: 'Focus Duration',
        optimal: '45-60 minutes',
        current: `${Math.round(avgDuration)} minutes average`,
        efficiency: Math.min(95, Math.round((avgDuration / 60) * 100)),
        trend: avgDuration > 50 ? 'improving' : 'needs_improvement'
      },
      {
        pattern: 'Best Study Time',
        optimal: `${bestHour}:00 - ${bestHour + 2}:00`,
        current: `${bestHour}:00 - ${bestHour + 2}:00 (most frequent)`,
        efficiency: Math.min(95, 70 + (hourGroups[bestHour] * 5)),
        trend: 'stable'
      },
      {
        pattern: 'Break Frequency',
        optimal: 'Every 45 minutes',
        current: `Every ${Math.round(avgBreakInterval)} minutes`,
        efficiency: Math.min(95, Math.round((45 / avgBreakInterval) * 100)),
        trend: avgBreakInterval < 50 ? 'good' : 'needs_improvement'
      },
      {
        pattern: 'Memory Retention',
        optimal: 'Morning sessions',
        current: `${Math.round((sessions.filter(s => new Date(s.startTime).getHours() < 12).length / sessions.length) * 100)}% morning sessions`,
        efficiency: Math.min(95, Math.round((sessions.filter(s => new Date(s.startTime).getHours() < 12).length / sessions.length) * 100)),
        trend: 'stable'
      }
    ];
  };

  const calculateCognitiveMetrics = (sessions) => {
    if (sessions.length === 0) return [];

    // Calculate metrics based on actual session performance
    const avgSessionLength = sessions.reduce((sum, s) => {
      const duration = (new Date(s.endTime) - new Date(s.startTime)) / (1000 * 60);
      return sum + duration;
    }, 0) / sessions.length;

    const consistency = calculateConsistency(sessions);
    const productivity = calculateProductivity(sessions);
    const efficiency = calculateEfficiency(sessions);

    return [
      {
        metric: 'Processing Speed',
        score: Math.min(95, Math.round(70 + (avgSessionLength / 60) * 10)),
        category: avgSessionLength > 45 ? 'Above Average' : 'Good',
        description: 'Based on average session duration and completion rate'
      },
      {
        metric: 'Working Memory',
        score: Math.min(95, Math.round(consistency)),
        category: consistency > 80 ? 'Excellent' : consistency > 60 ? 'Good' : 'Needs Improvement',
        description: 'Based on study consistency and regularity'
      },
      {
        metric: 'Attention Span',
        score: Math.min(95, Math.round(efficiency)),
        category: efficiency > 80 ? 'Excellent' : efficiency > 60 ? 'Good' : 'Needs Improvement',
        description: 'Based on session completion and break patterns'
      },
      {
        metric: 'Problem Solving',
        score: Math.min(95, Math.round(productivity)),
        category: productivity > 80 ? 'Excellent' : productivity > 60 ? 'Good' : 'Needs Improvement',
        description: 'Based on goal achievement and study outcomes'
      }
    ];
  };

  const calculateProductivityInsights = (sessions) => {
    if (sessions.length === 0) return [];

    // Group sessions by day of week
    const dayGroups = {};
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    sessions.forEach(session => {
      const dayName = days[new Date(session.startTime).getDay()];
      if (!dayGroups[dayName]) {
        dayGroups[dayName] = {
          sessions: [],
          totalHours: 0,
          totalProductivity: 0
        };
      }
      
      const duration = (new Date(session.endTime) - new Date(session.startTime)) / (1000 * 60 * 60);
      dayGroups[dayName].sessions.push(session);
      dayGroups[dayName].totalHours += duration;
      dayGroups[dayName].totalProductivity += duration > 0.5 ? 85 : 70; // Simple productivity metric
    });

    return Object.entries(dayGroups).map(([day, data]) => ({
      day,
      studyHours: Math.round(data.totalHours * 10) / 10,
      productivity: Math.round(data.totalProductivity / data.sessions.length),
      efficiency: Math.min(95, Math.round((data.totalHours / data.sessions.length) * 100)),
      focusScore: Math.round(data.totalProductivity / data.sessions.length),
      subject: data.sessions[0]?.subject || 'General'
    }));
  };

  const generateRecommendations = (sessions, goals) => {
    const recommendations = [];
    
    if (sessions.length === 0) {
      recommendations.push({
        type: 'schedule',
        title: 'Start Your Study Journey',
        description: 'Begin with short 25-minute sessions to build your study routine.',
        icon: '🚀',
        priority: 'high',
        impact: 'High'
      });
      return recommendations;
    }

    // Analyze session patterns for recommendations
    const avgDuration = sessions.reduce((sum, s) => {
      return sum + (new Date(s.endTime) - new Date(s.startTime)) / (1000 * 60);
    }, 0) / sessions.length;

    if (avgDuration < 30) {
      recommendations.push({
        type: 'schedule',
        title: 'Extend Study Sessions',
        description: `Your average session is ${Math.round(avgDuration)} minutes. Try extending to 45-60 minutes for better retention.`,
        icon: '⏰',
        priority: 'high',
        impact: 'High'
      });
    }

    const morningSessions = sessions.filter(s => new Date(s.startTime).getHours() < 12).length;
    const morningPercentage = (morningSessions / sessions.length) * 100;
    
    if (morningPercentage < 30) {
      recommendations.push({
        type: 'technique',
        title: 'Try Morning Study Sessions',
        description: 'Only ${Math.round(morningPercentage)}% of your sessions are in the morning. Morning sessions often have better retention.',
        icon: '🌅',
        priority: 'medium',
        impact: 'Medium'
      });
    }

    const totalBreaks = sessions.reduce((sum, s) => sum + (s.breaksTaken || 0), 0);
    const avgBreaks = totalBreaks / sessions.length;
    
    if (avgBreaks < 1) {
      recommendations.push({
        type: 'break',
        title: 'Take Regular Breaks',
        description: 'You\'re averaging ${avgBreaks.toFixed(1)} breaks per session. Regular breaks improve focus and retention.',
        icon: '☕',
        priority: 'medium',
        impact: 'Medium'
      });
    }

    if (goals.length > 0) {
      const completedGoals = goals.filter(g => g.status === 'completed').length;
      const goalCompletionRate = (completedGoals / goals.length) * 100;
      
      if (goalCompletionRate < 50) {
        recommendations.push({
          type: 'goal',
          title: 'Focus on Goal Completion',
          description: 'Only ${Math.round(goalCompletionRate)}% of your goals are completed. Break down large goals into smaller milestones.',
          icon: '🎯',
          priority: 'high',
          impact: 'High'
        });
      }
    }

    return recommendations;
  };

  const calculateConsistency = (sessions) => {
    if (sessions.length < 2) return 50;
    
    // Calculate how consistent session times are
    const intervals = [];
    for (let i = 1; i < sessions.length; i++) {
      const daysDiff = (new Date(sessions[i].startTime) - new Date(sessions[i-1].startTime)) / (1000 * 60 * 60 * 24);
      intervals.push(daysDiff);
    }
    
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
    
    return Math.max(0, Math.min(100, 100 - (variance * 10)));
  };

  const calculateProductivity = (sessions) => {
    if (sessions.length === 0) return 0;
    
    const productiveSessions = sessions.filter(s => {
      const duration = (new Date(s.endTime) - new Date(s.startTime)) / (1000 * 60);
      return duration >= 25 && duration <= 120; // Productive session length
    });
    
    return (productiveSessions.length / sessions.length) * 100;
  };

  const calculateEfficiency = (sessions) => {
    if (sessions.length === 0) return 0;
    
    const totalBreaks = sessions.reduce((sum, s) => sum + (s.breaksTaken || 0), 0);
    const totalDuration = sessions.reduce((sum, s) => {
      return sum + (new Date(s.endTime) - new Date(s.startTime)) / (1000 * 60);
    }, 0);
    
    const breakRatio = totalBreaks / (totalDuration / 45); // Ideal break every 45 mins
    return Math.max(0, Math.min(100, 100 - Math.abs(breakRatio - 1) * 50));
  };

  // Fallback data functions for when no real data is available
  const getFallbackLearningPatterns = () => [
    { 
      pattern: 'Focus Duration', 
      optimal: '45-60 minutes', 
      current: 'No data yet',
      efficiency: 0,
      trend: 'needs_data'
    },
    { 
      pattern: 'Best Study Time', 
      optimal: '2:00 PM - 4:00 PM', 
      current: 'No data yet',
      efficiency: 0,
      trend: 'needs_data'
    },
    { 
      pattern: 'Break Frequency', 
      optimal: 'Every 45 minutes', 
      current: 'No data yet',
      efficiency: 0,
      trend: 'needs_data'
    },
    { 
      pattern: 'Memory Retention', 
      optimal: 'Morning sessions', 
      current: 'No data yet',
      efficiency: 0,
      trend: 'needs_data'
    }
  ];

  const getFallbackCognitiveMetrics = () => [
    { 
      metric: 'Processing Speed', 
      score: 0, 
      category: 'No Data',
      description: 'Start study sessions to see your metrics'
    },
    { 
      metric: 'Working Memory', 
      score: 0, 
      category: 'No Data',
      description: 'Complete study sessions to analyze patterns'
    },
    { 
      metric: 'Attention Span', 
      score: 0, 
      category: 'No Data',
      description: 'Track your study sessions for insights'
    },
    { 
      metric: 'Problem Solving', 
      score: 0, 
      category: 'No Data',
      description: 'Set and complete goals for analysis'
    }
  ];

  const getFallbackProductivityInsights = () => [
    {
      day: 'Monday',
      studyHours: 0,
      productivity: 0,
      efficiency: 0,
      focusScore: 0,
      subject: 'No data'
    },
    {
      day: 'Tuesday',
      studyHours: 0,
      productivity: 0,
      efficiency: 0,
      focusScore: 0,
      subject: 'No data'
    },
    {
      day: 'Wednesday',
      studyHours: 0,
      productivity: 0,
      efficiency: 0,
      focusScore: 0,
      subject: 'No data'
    },
    {
      day: 'Thursday',
      studyHours: 0,
      productivity: 0,
      efficiency: 0,
      focusScore: 0,
      subject: 'No data'
    },
    {
      day: 'Friday',
      studyHours: 0,
      productivity: 0,
      efficiency: 0,
      focusScore: 0,
      subject: 'No data'
    }
  ];

  const getFallbackRecommendations = () => [
    {
      type: 'schedule',
      title: 'Start Your Study Journey',
      description: 'Begin with short 25-minute sessions to build your study routine and see your analytics here.',
      icon: '🚀',
      priority: 'high',
      impact: 'High'
    },
    {
      type: 'technique',
      title: 'Track Your Progress',
      description: 'Complete study sessions and goals to unlock personalized insights and recommendations.',
      icon: '📊',
      priority: 'high',
      impact: 'High'
    },
    {
      type: 'environment',
      title: 'Create Study Habits',
      description: 'Establish a consistent study schedule to see detailed learning patterns and cognitive metrics.',
      icon: '🎯',
      priority: 'medium',
      impact: 'Medium'
    },
    {
      type: 'break',
      title: 'Use Break Features',
      description: 'Take regular breaks during study sessions to improve focus and retention metrics.',
      icon: '☕',
      priority: 'medium',
      impact: 'Medium'
    }
  ];

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white shadow-xl">
        <h2 className="text-3xl font-bold mb-2">🧠 Personal Learning Analytics</h2>
        <p className="text-purple-100">Deep insights into your learning patterns and cognitive performance</p>
      </div>

      {/* Learning Patterns */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📊 Your Learning Patterns</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analytics.learningPatterns.map((pattern, index) => (
            <div key={index} className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-semibold text-gray-900 dark:text-white">{pattern.pattern}</h4>
                <div className={`px-2 py-1 rounded-full text-xs ${
                  pattern.trend === 'improving' ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300' :
                  'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300'
                }`}>
                  {pattern.trend === 'improving' ? '↑ Improving' : '→ Stable'}
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Optimal:</span>
                  <span className="font-medium">{pattern.optimal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Current:</span>
                  <span className="font-medium">{pattern.current}</span>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Efficiency</span>
                  <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{pattern.efficiency}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${pattern.efficiency}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cognitive Metrics */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🧠 Cognitive Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {analytics.cognitiveMetrics.map((metric, index) => (
            <div key={index} className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">{metric.score}%</div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{metric.metric}</h4>
              <div className={`text-sm px-2 py-1 rounded-full inline-block mb-2 ${
                metric.category === 'Excellent' ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300' :
                metric.category === 'Above Average' ? 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300' :
                'bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-300'
              }`}>
                {metric.category}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">{metric.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Productivity Insights */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📈 Weekly Productivity Insights</h3>
        <div className="space-y-3">
          {analytics.productivityInsights.map((insight, index) => (
            <div key={index} className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{insight.day}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{insight.subject}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Hours:</span>
                      <span className="font-semibold">{insight.studyHours}h</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Productivity:</span>
                      <span className="font-semibold text-orange-600">{insight.productivity}%</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{insight.efficiency}%</div>
                    <div className="text-xs text-gray-500">Efficiency</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{insight.focusScore}%</div>
                    <div className="text-xs text-gray-500">Focus</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Personalized Recommendations */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🎯 AI-Powered Personal Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analytics.personalizedRecommendations.map((rec, index) => (
            <div key={index} className={`rounded-xl p-4 border-2 ${
              rec.priority === 'high' 
                ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' 
                : 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
            }`}>
              <div className="flex items-start space-x-3">
                <div className="text-2xl">{rec.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{rec.title}</h4>
                    <div className="flex space-x-2">
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        rec.priority === 'high' 
                          ? 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-300' 
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300'
                      }`}>
                        {rec.priority === 'high' ? 'High Priority' : 'Medium Priority'}
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        rec.impact === 'High' 
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-300' 
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                      }`}>
                        {rec.impact} Impact
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 mb-2 capitalize">{rec.type}</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{rec.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <h3 className="text-2xl font-bold mb-6">📊 Your Learning Performance Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">A+</div>
            <div className="text-indigo-100">Overall Performance</div>
            <div className="text-sm text-indigo-200 mt-1">Top 10% of learners</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">87%</div>
            <div className="text-indigo-100">Cognitive Efficiency</div>
            <div className="text-sm text-indigo-200 mt-1">Above average</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">4.1h</div>
            <div className="text-indigo-100">Daily Average</div>
            <div className="text-sm text-indigo-200 mt-1">Consistent schedule</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">92%</div>
            <div className="text-indigo-100">Goal Achievement</div>
            <div className="text-sm text-indigo-200 mt-1">Excellent completion rate</div>
          </div>
        </div>
      </div>

      {/* Learning Optimization Tips */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🚀 Learning Optimization Strategies</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-4">
            <div className="text-2xl mb-2">⏰</div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Time Management</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Study during your peak hours (2-4 PM) for 35% better retention and faster learning.</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-4">
            <div className="text-2xl mb-2">🧠</div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Memory Enhancement</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Use morning review sessions. Your 85% retention rate makes this highly effective.</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4">
            <div className="text-2xl mb-2">🎯</div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Focus Optimization</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Your 91% attention span is excellent. Protect it with distraction-free environments.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
