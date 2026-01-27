import { useState, useEffect } from 'react';
import { analyticsAPI, usageAPI } from '../services/api';
import { UsageEntry } from '../components/UsageEntry';
import { UsageHistory } from '../components/UsageHistory';
import { DigitalHonestyScore } from '../components/DigitalHonestyScore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { format } from 'date-fns';
import { formatMinutesToHours } from '../utils/timeFormatter';

const COLORS = ['#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [usageEntries, setUsageEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchDashboardData();
    fetchUsageEntries();
  }, [refreshKey]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await analyticsAPI.getDashboard();
      setDashboardData(response.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsageEntries = async () => {
    try {
      const response = await usageAPI.getAll({ limit: 1000 });
      setUsageEntries(response.data.data.logs || []);
    } catch (err) {
      console.error('Failed to load usage entries:', err);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    fetchUsageEntries();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="text-red-600 dark:text-red-400">{error}</div>
        <button onClick={fetchDashboardData} className="btn-primary mt-4">
          Retry
        </button>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const { daily, weekly, monthly, riskScore, topApps, recommendations, charts } = dashboardData;

  // Format risk badge color
  const getRiskColor = (level) => {
    switch (level) {
      case 'low': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700';
      case 'moderate': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700';
      case 'high': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your social media usage patterns
          </p>
        </div>
        <button onClick={handleRefresh} className="btn-primary">
          Refresh
        </button>
      </div>

      {/* Risk Score Badge */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Behavioral Risk Indicator</h2>
          <span className={`px-4 py-1 rounded-full border font-medium ${getRiskColor(riskScore.level)}`}>
            {riskScore.category} Risk
          </span>
        </div>
        <div className="mb-4">
          <div className="flex items-center space-x-4">
            <div className="text-4xl font-bold">{riskScore.score}</div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    riskScore.level === 'high' ? 'bg-red-500' :
                    riskScore.level === 'moderate' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${riskScore.score}%` }}
                />
              </div>
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 italic">
          {riskScore.message}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
          * This is a behavioral indicator, not a medical diagnosis
        </p>
      </div>

      {/* Digital Honesty Score */}
      <DigitalHonestyScore entries={usageEntries} />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today */}
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Today</h3>
          <div className="text-3xl font-bold mb-1">
            {formatMinutesToHours(daily.totalMinutes)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {daily.appCount} {daily.appCount === 1 ? 'app' : 'apps'}
          </div>
        </div>

        {/* This Week */}
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">This Week</h3>
          <div className="text-3xl font-bold mb-1">
            {formatMinutesToHours(weekly.totalMinutes)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Avg: {formatMinutesToHours(weekly.averageDailyMinutes)}/day
          </div>
        </div>

        {/* This Month */}
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">This Month</h3>
          <div className="text-3xl font-bold mb-1">
            {formatMinutesToHours(monthly.totalMinutes)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {monthly.daysActive} days active
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Usage Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Daily Usage (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={charts.daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                stroke="#6b7280"
              />
              <YAxis stroke="#6b7280" />
              <Tooltip
                labelFormatter={(date) => format(new Date(date), 'MMM dd, yyyy')}
                formatter={(value) => [formatMinutesToHours(value), 'Usage']}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="minutes"
                stroke="#0ea5e9"
                strokeWidth={2}
                name="Minutes"
                dot={{ fill: '#0ea5e9', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Apps Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Top Apps This Week</h3>
          {topApps && topApps.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={topApps}
                  dataKey="minutes"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, minutes }) => `${name}: ${formatMinutesToHours(minutes)}`}
                >
                  {topApps.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [formatMinutesToHours(value), 'Usage']}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Personalized Recommendations</h3>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{rec.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{rec.message}</p>
                  </div>
                  {rec.actionable && (
                    <span className="ml-4 px-2 py-1 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 rounded">
                      Actionable
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Usage Entry */}
      <UsageEntry onSuccess={handleRefresh} />

      {/* Usage History */}
      <UsageHistory onUpdate={handleRefresh} />
    </div>
  );
};
