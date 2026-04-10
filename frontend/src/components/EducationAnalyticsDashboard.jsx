import { useState, useEffect } from 'react';

export const EducationAnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState({
    studyPatterns: [],
    socialBehaviour: [],
    learningProgress: [],
    recommendations: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching analytics data
    setTimeout(() => {
      setAnalytics({
        studyPatterns: [
          { day: 'Monday', hours: 4.5, efficiency: 85, subject: 'Mathematics' },
          { day: 'Tuesday', hours: 3.2, efficiency: 92, subject: 'Physics' },
          { day: 'Wednesday', hours: 5.1, efficiency: 78, subject: 'Chemistry' },
          { day: 'Thursday', hours: 2.8, efficiency: 88, subject: 'Biology' },
          { day: 'Friday', hours: 4.0, efficiency: 95, subject: 'Mathematics' }
        ],
        socialBehaviour: [
          { metric: 'Study Groups', value: 85, trend: 'up' },
          { metric: 'Peer Interaction', value: 72, trend: 'stable' },
          { metric: 'Collaboration', value: 90, trend: 'up' },
          { metric: 'Communication', value: 78, trend: 'down' }
        ],
        learningProgress: [
          { subject: 'Mathematics', progress: 75, target: 100, color: '#3B82F6' },
          { subject: 'Physics', progress: 60, target: 100, color: '#10B981' },
          { subject: 'Chemistry', progress: 45, target: 100, color: '#F59E0B' },
          { subject: 'Biology', progress: 80, target: 100, color: '#EF4444' }
        ],
        recommendations: [
          {
            type: 'study',
            title: 'Optimal Study Time',
            description: 'Your peak efficiency is between 2-4 PM. Schedule important topics during this time.',
            priority: 'high',
            icon: '⏰'
          },
          {
            type: 'social',
            title: 'Join Study Groups',
            description: 'Your collaboration scores are high. Consider forming study groups for complex topics.',
            priority: 'medium',
            icon: '👥'
          },
          {
            type: 'learning',
            title: 'Focus on Chemistry',
            description: 'Chemistry progress is below target. Dedicate extra time this week.',
            priority: 'high',
            icon: '🧪'
          }
        ]
      });
      setLoading(false);
    }, 1500);
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white shadow-xl">
        <h2 className="text-3xl font-bold mb-2">📚 Education & Social Behaviour Analytics</h2>
        <p className="text-purple-100">Unified analysis of your learning patterns and social interactions</p>
      </div>

      {/* Study Patterns */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📈 Weekly Study Patterns</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {analytics.studyPatterns.map((pattern, index) => (
            <div key={index} className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{pattern.day}</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{pattern.hours}h</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Efficiency: {pattern.efficiency}%</div>
              <div className="text-xs text-gray-400 mt-1">{pattern.subject}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Social Behaviour Metrics */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🤝 Social Behaviour Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {analytics.socialBehaviour.map((metric, index) => (
            <div key={index} className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="text-sm text-gray-600 dark:text-gray-400">{metric.metric}</div>
                <div className={`text-xs px-2 py-1 rounded-full ${
                  metric.trend === 'up' ? 'bg-green-100 text-green-700' :
                  metric.trend === 'down' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'}
                </div>
              </div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{metric.value}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Learning Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🎯 Learning Progress</h3>
        <div className="space-y-4">
          {analytics.learningProgress.map((subject, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-32">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{subject.subject}</div>
              </div>
              <div className="flex-1">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full transition-all duration-500"
                    style={{ 
                      width: `${subject.progress}%`,
                      backgroundColor: subject.color 
                    }}
                  />
                </div>
              </div>
              <div className="w-16 text-right">
                <div className="text-sm font-bold" style={{ color: subject.color }}>
                  {subject.progress}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🤖 AI-Powered Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {analytics.recommendations.map((rec, index) => (
            <div key={index} className={`rounded-xl p-4 border-2 ${
              rec.priority === 'high' 
                ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' 
                : 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
            }`}>
              <div className="flex items-start space-x-3">
                <div className="text-2xl">{rec.icon}</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{rec.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{rec.description}</p>
                  <div className={`mt-2 text-xs px-2 py-1 rounded-full inline-block ${
                    rec.priority === 'high' 
                      ? 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-300' 
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300'
                  }`}>
                    {rec.priority === 'high' ? 'High Priority' : 'Medium Priority'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Behavioural Insights */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <h3 className="text-2xl font-bold mb-4">🧠 Behavioural Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">87%</div>
            <div className="text-indigo-100">Study Consistency</div>
            <div className="text-sm text-indigo-200 mt-1">Above average performance</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">4.2h</div>
            <div className="text-indigo-100">Daily Average</div>
            <div className="text-sm text-indigo-200 mt-1">Optimal study duration</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">92%</div>
            <div className="text-indigo-100">Social Engagement</div>
            <div className="text-sm text-indigo-200 mt-1">Excellent collaboration</div>
          </div>
        </div>
      </div>
    </div>
  );
};
