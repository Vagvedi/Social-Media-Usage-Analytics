import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { studyAPI } from '../services/api';

export const StudyStatistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');

  useEffect(() => {
    fetchStatistics();
  }, [timeRange]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await studyAPI.getAnalytics({ period: timeRange });
      console.log('Statistics response:', response.data); // Debug log
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeeklyData = () => {
    if (!stats) return [];
    
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, index) => ({
      day,
      hours: Math.random() * 4 + 1, // Mock data - replace with real data
      sessions: Math.floor(Math.random() * 3 + 1)
    }));
  };

  const getSubjectDistribution = () => {
    console.log('Stats object:', stats); // Debug log
    
    if (!stats || !stats.subjectBreakdown) {
      return [
        { name: 'No Data', value: 100, color: '#9CA3AF' }
      ];
    }
    
    const subjects = stats.subjectBreakdown;
    const totalHours = Object.values(subjects).reduce((sum, hours) => sum + hours, 0);
    
    if (totalHours === 0) {
      return [
        { name: 'No Data', value: 100, color: '#9CA3AF' }
      ];
    }

    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    
    return Object.entries(subjects).map(([subject, hours], index) => ({
      name: subject,
      value: Math.round((hours / totalHours) * 100),
      color: COLORS[index % COLORS.length]
    }));
  };

  const getFocusTrends = () => {
    if (!stats) return [];
    
    return [
      { date: 'Mon', focus: 75, target: 80 },
      { date: 'Tue', focus: 82, target: 80 },
      { date: 'Wed', focus: 78, target: 80 },
      { date: 'Thu', focus: 85, target: 80 },
      { date: 'Fri', focus: 88, target: 80 },
      { date: 'Sat', focus: 92, target: 80 },
      { date: 'Sun', focus: 79, target: 80 }
    ];
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Study Statistics</h3>
          <div className="flex space-x-2">
            {['day', 'week', 'month'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Hours</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalHours}</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">↑ 12% from last {timeRange}</p>
              </div>
              <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">⏱️</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Focus Score</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.averageFocusScore}%</p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">↑ 5% improvement</p>
              </div>
              <div className="h-8 w-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">🎯</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalSessions}</p>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">↑ 8% from last {timeRange}</p>
              </div>
              <div className="h-8 w-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">📚</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Study Streak</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.studyStreak} days</p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">🔥 Keep it going!</p>
              </div>
              <div className="h-8 w-8 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">🔥</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Study Hours */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Weekly Study Hours</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={getWeeklyData()}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="day" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
              labelStyle={{ color: '#f3f4f6' }}
            />
            <Bar dataKey="hours" fill="#3B82F6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Focus Trends */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Focus Score Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={getFocusTrends()}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
              labelStyle={{ color: '#f3f4f6' }}
            />
            <Line 
              type="monotone" 
              dataKey="focus" 
              stroke="#3B82F6" 
              strokeWidth={2}
              dot={{ fill: '#3B82F6', r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="target" 
              stroke="#10B981" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Subject Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Subject Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={getSubjectDistribution()}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {getSubjectDistribution().map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
              labelStyle={{ color: '#f3f4f6' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
