import { useState, useEffect } from 'react';

export const BehaviouralInsights = () => {
  const [insights, setInsights] = useState({
    learningStyles: [],
    cognitivePatterns: [],
    socialBehaviors: [],
    recommendations: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setInsights({
        learningStyles: [
          { style: 'Visual Learner', percentage: 75, description: 'Learns best through images and diagrams' },
          { style: 'Kinesthetic Learner', percentage: 60, description: 'Learns best through hands-on experience' },
          { style: 'Auditory Learner', percentage: 45, description: 'Learns best through listening and discussion' },
          { style: 'Reading/Writing', percentage: 80, description: 'Learns best through text and notes' }
        ],
        cognitivePatterns: [
          { pattern: 'Peak Focus Time', time: '2:00 PM - 4:00 PM', efficiency: 92 },
          { pattern: 'Memory Retention', best: 'Morning', retention: 85 },
          { pattern: 'Problem Solving', approach: 'Analytical', score: 88 },
          { pattern: 'Creativity Peak', time: '10:00 AM - 12:00 PM', score: 76 }
        ],
        socialBehaviors: [
          { behavior: 'Collaboration Preference', value: 'Group Study', percentage: 85 },
          { behavior: 'Communication Style', value: 'Visual', percentage: 70 },
          { behavior: 'Leadership Tendency', value: 'Moderate', percentage: 65 },
          { behavior: 'Peer Influence', value: 'Positive', percentage: 90 }
        ],
        recommendations: [
          {
            category: 'Study Optimization',
            title: 'Schedule Complex Topics During Peak Hours',
            description: 'Your focus peaks between 2-4 PM. Schedule challenging subjects during this time for maximum retention.',
            icon: '🕐',
            priority: 'high'
          },
          {
            category: 'Learning Style',
            title: 'Incorporate More Visual Elements',
            description: 'As a strong visual learner, use diagrams, charts, and mind maps to enhance comprehension.',
            icon: '🎨',
            priority: 'medium'
          },
          {
            category: 'Social Learning',
            title: 'Leverage Group Study Sessions',
            description: 'Your high collaboration preference suggests you learn well in groups. Form study partnerships for difficult subjects.',
            icon: '👥',
            priority: 'high'
          },
          {
            category: 'Memory Enhancement',
            title: 'Review Sessions in Morning',
            description: 'Your memory retention is highest in the morning. Use this time for review and consolidation.',
            icon: '🧠',
            priority: 'medium'
          }
        ]
      });
      setLoading(false);
    }, 1200);
  }, []);

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
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <h2 className="text-3xl font-bold mb-2">🧠 Behavioural Insights & Educational Psychology</h2>
        <p className="text-indigo-100">Deep analysis of your learning patterns and cognitive behaviors</p>
      </div>

      {/* Learning Styles Analysis */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🎯 Learning Styles Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.learningStyles.map((style, index) => (
            <div key={index} className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-900 dark:text-white">{style.style}</h4>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{style.percentage}%</div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${style.percentage}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{style.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cognitive Patterns */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">⚡ Cognitive Patterns</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {insights.cognitivePatterns.map((pattern, index) => (
            <div key={index} className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-4 text-center">
              <div className="text-3xl mb-2">
                {pattern.pattern === 'Peak Focus Time' && '🎯'}
                {pattern.pattern === 'Memory Retention' && '🧠'}
                {pattern.pattern === 'Problem Solving' && '💡'}
                {pattern.pattern === 'Creativity Peak' && '🎨'}
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{pattern.pattern}</h4>
              <div className="text-lg text-green-600 dark:text-green-400 mb-1">
                {pattern.time || pattern.approach || pattern.best}
              </div>
              <div className="text-sm text-gray-500">
                {pattern.efficiency && `Efficiency: ${pattern.efficiency}%`}
                {pattern.retention && `Retention: ${pattern.retention}%`}
                {pattern.score && `Score: ${pattern.score}%`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Social Behaviors */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🤝 Social Learning Behaviors</h3>
        <div className="space-y-4">
          {insights.socialBehaviors.map((behavior, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl">
              <div className="flex items-center space-x-4">
                <div className="text-2xl">
                  {behavior.behavior === 'Collaboration Preference' && '👥'}
                  {behavior.behavior === 'Communication Style' && '💬'}
                  {behavior.behavior === 'Leadership Tendency' && '👑'}
                  {behavior.behavior === 'Peer Influence' && '🤝'}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{behavior.behavior}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{behavior.value}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{behavior.percentage}%</div>
                <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${behavior.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Personalized Recommendations */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🎯 Personalized Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.recommendations.map((rec, index) => (
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
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      rec.priority === 'high' 
                        ? 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-300' 
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300'
                    }`}>
                      {rec.priority === 'high' ? 'High Priority' : 'Medium Priority'}
                    </div>
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 mb-2">{rec.category}</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{rec.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Educational Psychology Metrics */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
        <h3 className="text-2xl font-bold mb-6">📊 Educational Psychology Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">A+</div>
            <div className="text-purple-100">Learning Adaptability</div>
            <div className="text-sm text-purple-200 mt-1">Excellent flexibility</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">92%</div>
            <div className="text-purple-100">Cognitive Efficiency</div>
            <div className="text-sm text-purple-200 mt-1">Above average</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">4.5h</div>
            <div className="text-purple-100">Optimal Study Duration</div>
            <div className="text-sm text-purple-200 mt-1">Per session</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">88%</div>
            <div className="text-purple-100">Social Learning Index</div>
            <div className="text-sm text-purple-200 mt-1">Strong collaborator</div>
          </div>
        </div>
      </div>

      {/* Actionable Insights */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🚀 Actionable Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-4">
            <div className="text-2xl mb-2">⏰</div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Time Optimization</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Schedule challenging topics during your peak focus hours (2-4 PM) for 40% better retention.</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-4">
            <div className="text-2xl mb-2">🎨</div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Visual Learning Enhancement</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Incorporate mind maps, diagrams, and visual aids to leverage your strong visual learning preference.</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4">
            <div className="text-2xl mb-2">👥</div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Social Learning Strategy</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Form study groups for complex subjects. Your collaboration score suggests 35% better group learning outcomes.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
