import { useState, useEffect } from 'react';
import { studyAPI } from '../services/api';

export const StudyStreak = () => {
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [recentDays, setRecentDays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStreakData();
  }, []);

  const fetchStreakData = async () => {
    try {
      setLoading(true);
      
      // Get analytics for streak info
      const response = await studyAPI.getAnalytics({ period: 'month' });
      const analytics = response.data.data;
      
      setStreak(analytics.studyStreak || 0);
      setLongestStreak(analytics.longestStreak || 0);

      // Generate recent days data (mock for now)
      const days = [];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dateStr = date.toISOString().split('T')[0];
        
        // Mock data - in real app, this would come from API
        const hasStudied = Math.random() > 0.3; // 70% chance of studying
        
        days.push({
          date: dateStr,
          dayName,
          hasStudied,
          isToday: i === 0
        });
      }
      
      setRecentDays(days);
    } catch (error) {
      console.error('Error fetching streak data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStreakEmoji = (streak) => {
    if (streak >= 30) return '🔥🔥🔥';
    if (streak >= 14) return '🔥🔥';
    if (streak >= 7) return '🔥';
    if (streak >= 3) return '💪';
    if (streak >= 1) return '✅';
    return '😴';
  };

  const getStreakMessage = (streak) => {
    if (streak >= 30) return "Incredible! You're on fire! 🎉";
    if (streak >= 14) return "Amazing consistency! Keep it up! 💪";
    if (streak >= 7) return "Great job! One week strong! 🔥";
    if (streak >= 3) return "Good momentum! Keep going! 💪";
    if (streak >= 1) return "Started your streak! Keep it up! ✅";
    return "Start your study streak today! 📚";
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Study Streak</h3>
        
        <div className="text-6xl mb-4">
          {getStreakEmoji(streak)}
        </div>
        
        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {streak} Days
        </div>
        
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {getStreakMessage(streak)}
        </div>

        <div className="mb-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Longest streak: {longestStreak} days
          </div>
        </div>

        {/* Recent Days */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">Recent Activity</div>
          <div className="flex justify-center space-x-2">
            {recentDays.map((day, index) => (
              <div
                key={index}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                  day.isToday 
                    ? 'ring-2 ring-blue-500' 
                    : ''
                } ${
                  day.hasStudied
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                }`}
                title={`${day.dayName}${day.isToday ? ' (Today)' : ''}`}
              >
                {day.hasStudied ? '✓' : '—'}
              </div>
            ))}
          </div>
        </div>

        {/* Motivational Tips */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <div className="font-medium mb-1">💡 Streak Tip</div>
            <div>
              {streak === 0 && "Even 15 minutes counts! Start small and build consistency."}
              {streak > 0 && streak < 7 && "You're building momentum! Don't break the chain!"}
              {streak >= 7 && streak < 14 && "One week strong! You're developing a great habit!"}
              {streak >= 14 && "You're a study warrior! Your dedication is inspiring!"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
