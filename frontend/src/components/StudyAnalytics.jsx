import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { studyAPI } from '../services/api';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export const StudyAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      console.log('Fetching analytics for period:', period);
      console.log('Auth token:', localStorage.getItem('accessToken') ? 'Present' : 'Missing');
      
      const response = await studyAPI.getAnalytics({ period });
      console.log('Full API response:', response); // Debug full response
      console.log('Response data:', response.data); // Debug response data
      console.log('Analytics data structure:', response.data?.data); // Debug nested data
      
      // Backend returns: { success: true, data: { totalHours, totalSessions, ... } }
      setAnalytics(response.data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>No analytics data available</p>
      </div>
    );
  }

  // Generate sample chart data
  const weeklyData = [
    { day: 'Mon', studyHours: 2.5, socialHours: 3.2, focusScore: 78 },
    { day: 'Tue', studyHours: 3.8, socialHours: 2.1, focusScore: 85 },
    { day: 'Wed', studyHours: 1.2, socialHours: 4.5, focusScore: 65 },
    { day: 'Thu', studyHours: 4.1, socialHours: 1.8, focusScore: 92 },
    { day: 'Fri', studyHours: 2.9, socialHours: 3.9, focusScore: 71 },
    { day: 'Sat', studyHours: 5.2, socialHours: 2.3, focusScore: 88 },
    { day: 'Sun', studyHours: 3.6, socialHours: 3.1, focusScore: 79 }
  ];

  const productivityData = [
    { time: '6AM', productivity: 95 },
    { time: '9AM', productivity: 88 },
    { time: '12PM', productivity: 72 },
    { time: '3PM', productivity: 65 },
    { time: '6PM', productivity: 78 },
    { time: '9PM', productivity: 82 },
    { time: '12AM', productivity: 45 }
  ];

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Study Analytics</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setPeriod('day')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === 'day' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setPeriod('week')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === 'week' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === 'month' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Month
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {analytics?.totalHours || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Hours</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {analytics?.totalSessions || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {analytics?.averageFocusScore || 0}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Focus Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {analytics?.studyStreak || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Day Streak</div>
          </div>
        </div>
      </div>

      {/* Weekly Study Hours */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Weekly Study Hours</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="studyHours" stackId="1" stroke="#3B82F6" fill="#3B82F6" name="Study Hours" />
            <Area type="monotone" dataKey="socialHours" stackId="2" stroke="#EF4444" fill="#EF4444" name="Social Media Hours" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Focus Score Trends */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Focus Score Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="focusScore" stroke="#8B5CF6" strokeWidth={2} name="Focus Score %" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Productivity by Time */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Productivity by Time of Day</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={productivityData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="productivity" fill="#10B981" name="Productivity %" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Insights & Recommendations */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI-Powered Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start space-x-3">
              <div className="h-6 w-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs">📊</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">Peak Performance Time</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You're maintaining a healthy study-to-social media ratio. Keep it up!
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start space-x-3">
              <div className="h-6 w-6 bg-yellow-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs">⚡</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">Study Consistency</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your study patterns are consistent. Consider varying study times for better retention.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
