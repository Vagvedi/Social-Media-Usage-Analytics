import { useState, useEffect } from 'react';
import { studyAPI } from '../services/api';

export const SmartStudyPlanner = () => {
  const [plannerData, setPlannerData] = useState({
    optimalSchedule: [],
    subjectRecommendations: [],
    timeBlocking: [],
    smartBreaks: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setPlannerData({
        optimalSchedule: [
          {
            time: '9:00 AM - 10:30 AM',
            subject: 'Mathematics',
            difficulty: 'Hard',
            reason: 'High focus morning session for complex topics',
            duration: 90,
            preparation: 'Review previous concepts first'
          },
          {
            time: '11:00 AM - 12:00 PM',
            subject: 'Physics',
            difficulty: 'Medium',
            reason: 'Good for problem-solving after warm-up',
            duration: 60,
            preparation: 'Practice problems from yesterday'
          },
          {
            time: '2:30 PM - 4:15 PM',
            subject: 'Chemistry',
            difficulty: 'Hard',
            reason: 'Peak cognitive performance period',
            duration: 105,
            preparation: 'Lab safety review required'
          },
          {
            time: '4:30 PM - 5:30 PM',
            subject: 'Biology',
            difficulty: 'Easy',
            reason: 'Good for memorization during energy dip',
            duration: 60,
            preparation: 'Flashcards ready'
          }
        ],
        subjectRecommendations: [
          {
            subject: 'Mathematics',
            currentLevel: 'Intermediate',
            nextTopics: ['Calculus Applications', 'Linear Algebra Basics', 'Statistics'],
            estimatedTime: '2 weeks',
            priority: 'High',
            confidence: 75
          },
          {
            subject: 'Physics',
            currentLevel: 'Advanced',
            nextTopics: ['Quantum Mechanics Intro', 'Thermodynamics', 'Wave Physics'],
            estimatedTime: '3 weeks',
            priority: 'Medium',
            confidence: 82
          },
          {
            subject: 'Chemistry',
            currentLevel: 'Beginner',
            nextTopics: ['Organic Chemistry Basics', 'Chemical Bonding', 'Reaction Types'],
            estimatedTime: '4 weeks',
            priority: 'High',
            confidence: 68
          },
          {
            subject: 'Biology',
            currentLevel: 'Intermediate',
            nextTopics: ['Cell Biology', 'Genetics', 'Ecology'],
            estimatedTime: '2.5 weeks',
            priority: 'Low',
            confidence: 88
          }
        ],
        timeBlocking: [
          {
            block: 'Deep Focus Session',
            duration: '90 minutes',
            bestFor: 'Complex problem-solving',
            subjects: ['Mathematics', 'Physics'],
            timeOfDay: 'Morning (9-11 AM)',
            tips: 'No distractions, phone away'
          },
          {
            block: 'Creative Learning',
            duration: '60 minutes',
            bestFor: 'Conceptual understanding',
            subjects: ['Biology', 'Chemistry'],
            timeOfDay: 'Afternoon (2-4 PM)',
            tips: 'Use visual aids and diagrams'
          },
          {
            block: 'Review & Practice',
            duration: '45 minutes',
            bestFor: 'Reinforcement',
            subjects: ['All subjects'],
            timeOfDay: 'Evening (6-7 PM)',
            tips: 'Quick recall exercises'
          },
          {
            block: 'Light Reading',
            duration: '30 minutes',
            bestFor: 'Background knowledge',
            subjects: ['Biology', 'Chemistry'],
            timeOfDay: 'Before bed (9-9:30 PM)',
            tips: 'Relaxed, no pressure'
          }
        ],
        smartBreaks: [
          {
            type: 'Pomodoro Break',
            duration: '5 minutes',
            frequency: 'Every 25 minutes',
            activities: ['Stretch', 'Deep breathing', 'Look away from screen'],
            effectiveness: 92
          },
          {
            type: 'Energy Break',
            duration: '15 minutes',
            frequency: 'Every 2 hours',
            activities: ['Walk around', 'Healthy snack', 'Listen to music'],
            effectiveness: 88
          },
          {
            type: 'Mental Reset',
            duration: '20 minutes',
            frequency: 'Every 3 hours',
            activities: ['Meditation', 'Quick nap', 'Change environment'],
            effectiveness: 95
          },
          {
            type: 'Transition Break',
            duration: '10 minutes',
            frequency: 'Between subjects',
            activities: ['Review notes', 'Prepare materials', 'Set goals'],
            effectiveness: 85
          }
        ]
      });
      setLoading(false);
    }, 1200);
  }, []);

  const startSession = async (subject) => {
    try {
      const response = await studyAPI.startSession({
        subject: subject,
        notes: `Started from Smart Planner - ${new Date().toLocaleString()}`,
        tags: ['smart-planner', 'optimized']
      });
      
      if (response.data.success) {
        if (window.studyNotifications) {
          window.studyNotifications(`Study session for ${subject} started! 📚`, 'success');
        }
        // Redirect to StudyHub to see the active session
        window.location.href = '/study-hub?tab=sessions';
      }
    } catch (error) {
      console.error('Error starting session:', error);
      if (window.studyNotifications) {
        window.studyNotifications('Failed to start study session', 'error');
      }
    }
  };

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
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-8 text-white shadow-xl">
        <h2 className="text-3xl font-bold mb-2">🎯 Smart Study Planner</h2>
        <p className="text-green-100">AI-powered scheduling and optimization for maximum learning efficiency</p>
      </div>

      {/* Optimal Daily Schedule */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📅 Your Optimal Daily Schedule</h3>
        <div className="space-y-3">
          {plannerData.optimalSchedule.map((session, index) => (
            <div key={index} className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{session.time}</div>
                    <div className="text-sm text-gray-500">{session.duration} min</div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{session.subject}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{session.reason}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        session.difficulty === 'Hard' ? 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-300' :
                        session.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-300' :
                        'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300'
                      }`}>
                        {session.difficulty}
                      </span>
                      <span className="text-xs text-gray-500">💡 {session.preparation}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => startSession(session.subject)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start Session
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subject Recommendations */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📚 Smart Subject Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plannerData.subjectRecommendations.map((subject, index) => (
            <div key={index} className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-semibold text-gray-900 dark:text-white">{subject.subject}</h4>
                <div className={`text-xs px-2 py-1 rounded-full ${
                  subject.priority === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-300' :
                  subject.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-300' :
                  'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300'
                }`}>
                  {subject.priority} Priority
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Current Level:</span>
                  <span className="font-medium">{subject.currentLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Estimated Time:</span>
                  <span className="font-medium">{subject.estimatedTime}</span>
                </div>
              </div>
              <div className="mt-3">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Confidence Level</div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${subject.confidence}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{subject.confidence}%</span>
                </div>
              </div>
              <div className="mt-3">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Next Topics:</div>
                <div className="flex flex-wrap gap-1">
                  {subject.nextTopics.map((topic, i) => (
                    <span key={i} className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-300 px-2 py-1 rounded">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <h3 className="text-2xl font-bold mb-6">🚀 Quick Study Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="p-4 bg-white/20 backdrop-blur-sm rounded-xl text-center hover:bg-white/30 transition-colors">
            <div className="text-3xl mb-2">▶️</div>
            <div className="font-semibold">Start Optimal Session</div>
            <div className="text-sm text-indigo-200">Begin AI-scheduled study</div>
          </button>
          <button className="p-4 bg-white/20 backdrop-blur-sm rounded-xl text-center hover:bg-white/30 transition-colors">
            <div className="text-3xl mb-2">📝</div>
            <div className="font-semibold">Generate Daily Plan</div>
            <div className="text-sm text-indigo-200">Create personalized schedule</div>
          </button>
          <button className="p-4 bg-white/20 backdrop-blur-sm rounded-xl text-center hover:bg-white/30 transition-colors">
            <div className="text-3xl mb-2">🎯</div>
            <div className="font-semibold">Set Study Goals</div>
            <div className="text-sm text-indigo-200">Define daily objectives</div>
          </button>
          <button className="p-4 bg-white/20 backdrop-blur-sm rounded-xl text-center hover:bg-white/30 transition-colors">
            <div className="text-3xl mb-2">📊</div>
            <div className="font-semibold">View Progress</div>
            <div className="text-sm text-indigo-200">Track your improvements</div>
          </button>
        </div>
      </div>
    </div>
  );
};
