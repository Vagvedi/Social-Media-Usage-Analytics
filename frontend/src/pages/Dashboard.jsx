import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI, usageAPI, studyAPI } from '../services/api';
import { UsageEntry } from '../components/UsageEntry';
import { UsageHistory } from '../components/UsageHistory';
import { DigitalHonestyScore } from '../components/DigitalHonestyScore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { format } from 'date-fns';
import { formatMinutesToHours } from '../utils/timeFormatter';

const CHART_COLORS = {
  primary: '#FE9EC7',   // Pink
  secondary: '#44ACFF', // Blue
  tertiary: '#89D4FF',  // Sky
  quaternary: '#F9F6C4', // Yellow
  quinary: '#0F172A',    // Dark Slate
  accent: '#FFD7E7',
  light: '#F8FAFC',
  dark: '#1E293B'
};

const GRADIENT_COLORS = [
  { start: '#FE9EC7', end: '#FFAFCD' }, // Pink
  { start: '#44ACFF', end: '#89D4FF' }, // Blue to Sky
  { start: '#F9F6C4', end: '#FCF9DB' }, // Yellow
  { start: '#89D4FF', end: '#E7F7FF' }, // Sky
  { start: '#FFC3DB', end: '#FE9EC7' }  // Pink depth
];

export const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [usageEntries, setUsageEntries] = useState([]);
  const [studyData, setStudyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchDashboardData();
    fetchUsageEntries();
    fetchStudyData();
  }, [refreshKey]);

  const fetchStudyData = async () => {
    try {
      const response = await studyAPI.getAnalytics({ period: 'week' });
      setStudyData(response.data.data);
    } catch (err) {
      console.error('Failed to load study data:', err);
    }
  };
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
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="text-red-600">{error}</div>
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
      case 'low': return 'risk-low';
      case 'moderate': return 'risk-moderate';
      case 'high': return 'risk-high';
      default: return 'bg-gray-100/70 text-gray-800 border-gray-300/50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="animate-slide-up">
          <h1 className="text-4xl font-black text-slate-800 mb-2">Dashboard</h1>
          <p className="text-ocean-600 text-lg font-medium">
            Track your social media usage patterns
          </p>
        </div>
        <button 
          onClick={handleRefresh} 
          className="btn-primary animate-slide-up group hover:shadow-xl hover:scale-105 transition-all duration-300" 
          style={{animationDelay: '0.1s'}}
        >
          <span className="flex items-center space-x-2">
            <svg className="w-5 h-5 group-hover:animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="group-hover:text-caramel-100 transition-colors duration-300">Refresh</span>
          </span>
        </button>
      </div>

      {/* Study Overview */}
      {studyData && (
        <div className="card animate-slide-up hover:shadow-2xl hover:bg-white/90 transition-all duration-500 group" style={{animationDelay: '0.2s'}}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-coffee-900 group-hover:text-caramel-700 transition-colors duration-300">Study Overview</h2>
            <Link to="/study-hub" className="inline-flex items-center space-x-2 text-caramel-600 hover:text-caramel-700 font-medium transition-all duration-300 hover:scale-105">
              <span>View Study Hub</span>
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="stat-card group hover:scale-105 hover:shadow-lg transition-all duration-300">
              <div className="text-3xl font-bold text-caramel-600 mb-1 group-hover:text-caramel-700 transition-colors duration-300">{studyData.totalHours}</div>
              <div className="text-sm text-coffee-600 font-medium">Study Hours (Week)</div>
            </div>
            <div className="stat-card group hover:scale-105 hover:shadow-lg transition-all duration-300">
              <div className="text-3xl font-bold text-coffee-600 mb-1 group-hover:text-coffee-700 transition-colors duration-300">{studyData.studyStreak}</div>
              <div className="text-sm text-coffee-600 font-medium">Day Streak</div>
            </div>
            <div className="stat-card group hover:scale-105 hover:shadow-lg transition-all duration-300">
              <div className="text-3xl font-bold text-caramel-500 mb-1 group-hover:text-caramel-600 transition-colors duration-300">{studyData.averageFocusScore}%</div>
              <div className="text-sm text-coffee-600 font-medium">Focus Score</div>
            </div>
            <div className="stat-card group hover:scale-105 hover:shadow-lg transition-all duration-300">
              <div className="text-3xl font-bold text-coffee-700 mb-1 group-hover:text-coffee-800 transition-colors duration-300">{studyData.totalSessions}</div>
              <div className="text-sm text-coffee-600 font-medium">Total Sessions</div>
            </div>
          </div>
        </div>
      )}
      {/* Risk Score Badge */}
      <div className="card animate-slide-up hover:shadow-2xl hover:bg-white/90 transition-all duration-500 group" style={{animationDelay: '0.3s'}}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-coffee-900 group-hover:text-caramel-700 transition-colors duration-300">Behavioral Risk Indicator</h2>
          <span className={`risk-badge ${getRiskColor(riskScore.level)} hover:scale-105 transition-transform duration-300`}>
            {riskScore.category} Risk
          </span>
        </div>
        <div className="mb-6">
          <div className="flex items-center space-x-6">
            <div className="text-5xl font-bold text-coffee-900 group-hover:text-caramel-700 transition-colors duration-300">{riskScore.score}</div>
            <div className="flex-1">
              <div className="progress-bar group-hover:shadow-lg transition-all duration-300">
                <div
                  className={`progress-fill group-hover:shadow-inner transition-all duration-700 ${
                    riskScore.level === 'high' ? 'bg-gradient-to-r from-red-400 to-red-600 hover:from-red-500 hover:to-red-700' :
                    riskScore.level === 'moderate' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700' : 'bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700'
                  }`}
                  style={{ width: `${riskScore.score}%` }}
                />
              </div>
            </div>
          </div>
        </div>
        <p className="text-coffee-600 italic mb-2 group-hover:text-coffee-700 transition-colors duration-300">
          {riskScore.message}
        </p>
        <p className="text-xs text-coffee-500 group-hover:text-coffee-600 transition-colors duration-300">
          * This is a behavioral indicator, not a medical diagnosis
        </p>
      </div>

      {/* Digital Honesty Score */}
      <DigitalHonestyScore entries={usageEntries} />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today */}
        <div className="stat-card animate-slide-up hover:scale-105 hover:shadow-xl hover:from-white/80 hover:to-white/60 transition-all duration-500 group" style={{animationDelay: '0.4s'}}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-coffee-600 group-hover:text-caramel-600 transition-colors duration-300">Today</h3>
            <div className="w-10 h-10 bg-gradient-to-br from-caramel-400 to-caramel-600 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <svg className="w-5 h-5 text-white group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-coffee-900 mb-1 group-hover:text-caramel-700 transition-colors duration-300">
            {formatMinutesToHours(daily.totalMinutes)}
          </div>
          <div className="text-sm text-coffee-600 group-hover:text-coffee-700 transition-colors duration-300">
            {daily.appCount} {daily.appCount === 1 ? 'app' : 'apps'}
          </div>
        </div>

        {/* This Week */}
        <div className="stat-card animate-slide-up hover:scale-105 hover:shadow-xl hover:from-white/80 hover:to-white/60 transition-all duration-500 group" style={{animationDelay: '0.5s'}}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-coffee-600 group-hover:text-caramel-600 transition-colors duration-300">This Week</h3>
            <div className="w-10 h-10 bg-gradient-to-br from-coffee-500 to-coffee-700 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <svg className="w-5 h-5 text-white group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-coffee-900 mb-1 group-hover:text-caramel-700 transition-colors duration-300">
            {formatMinutesToHours(weekly.totalMinutes)}
          </div>
          <div className="text-sm text-coffee-600 group-hover:text-coffee-700 transition-colors duration-300">
            Avg: {formatMinutesToHours(weekly.averageDailyMinutes)}/day
          </div>
        </div>

        {/* This Month */}
        <div className="stat-card animate-slide-up hover:scale-105 hover:shadow-xl hover:from-white/80 hover:to-white/60 transition-all duration-500 group" style={{animationDelay: '0.6s'}}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-coffee-600 group-hover:text-caramel-600 transition-colors duration-300">This Month</h3>
            <div className="w-10 h-10 bg-gradient-to-br from-caramel-500 to-caramel-700 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <svg className="w-5 h-5 text-white group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-coffee-900 mb-1 group-hover:text-caramel-700 transition-colors duration-300">
            {formatMinutesToHours(monthly.totalMinutes)}
          </div>
          <div className="text-sm text-coffee-600 group-hover:text-coffee-700 transition-colors duration-300">
            {monthly.daysActive} days active
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Usage Chart */}
        <div className="chart-container animate-slide-up hover:scale-[1.02] transition-transform duration-500" style={{animationDelay: '0.7s'}}>
          <h3 className="text-lg font-semibold text-coffee-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-caramel-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Daily Usage (Last 7 Days)
          </h3>
          <div className="bg-white/40 backdrop-blur-sm rounded-xl p-4 border border-coffee-100/30">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={charts.daily} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="coffeeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.light} strokeOpacity={0.3} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                  stroke={CHART_COLORS.tertiary}
                  tick={{ fill: CHART_COLORS.tertiary, fontSize: 12 }}
                />
                <YAxis stroke={CHART_COLORS.tertiary} tick={{ fill: CHART_COLORS.tertiary, fontSize: 12 }} />
                <Tooltip
                  labelFormatter={(date) => format(new Date(date), 'MMM dd, yyyy')}
                  formatter={(value) => [formatMinutesToHours(value), 'Usage']}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: `1px solid ${CHART_COLORS.primary}`,
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 32px rgba(212, 163, 115, 0.15)'
                  }}
                  labelStyle={{ color: CHART_COLORS.dark, fontWeight: 600 }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
                <Line
                  type="monotone"
                  dataKey="minutes"
                  stroke={CHART_COLORS.primary}
                  strokeWidth={3}
                  name="Minutes"
                  dot={{ fill: CHART_COLORS.secondary, r: 6, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8, fill: CHART_COLORS.accent }}
                  fill="url(#coffeeGradient)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Apps Chart */}
        <div className="chart-container animate-slide-up hover:scale-[1.02] transition-transform duration-500" style={{animationDelay: '0.8s'}}>
          <h3 className="text-lg font-semibold text-coffee-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-caramel-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
            Top Apps This Week
          </h3>
          {topApps && topApps.length > 0 ? (
            <div className="bg-white/40 backdrop-blur-sm rounded-xl p-4 border border-coffee-100/30">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <defs>
                    {GRADIENT_COLORS.map((gradient, index) => (
                      <radialGradient key={`gradient-${index}`} id={`pieGradient-${index}`}>
                        <stop offset="0%" stopColor={gradient.start} stopOpacity={1}/>
                        <stop offset="100%" stopColor={gradient.end} stopOpacity={0.8}/>
                      </radialGradient>
                    ))}
                  </defs>
                  <Pie
                    data={topApps}
                    dataKey="minutes"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={40}
                    paddingAngle={2}
                    label={({ name, minutes, percent }) => `${name}: ${formatMinutesToHours(minutes)} (${(percent * 100).toFixed(1)}%)`}
                    labelLine={false}
                    animationBegin={800}
                    animationDuration={1500}
                  >
                    {topApps.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`url(#pieGradient-${index})`}
                        stroke={CHART_COLORS.light}
                        strokeWidth={2}
                        className="hover:opacity-80 transition-opacity duration-300 cursor-pointer"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [formatMinutesToHours(value), 'Usage']}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: `1px solid ${CHART_COLORS.primary}`,
                      borderRadius: '12px',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 8px 32px rgba(212, 163, 115, 0.15)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-coffee-500 bg-white/40 backdrop-blur-sm rounded-xl border border-coffee-100/30">
              <div className="text-center animate-pulse">
                <svg className="w-16 h-16 mx-auto mb-4 text-coffee-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="font-medium">No data available</p>
                <p className="text-sm mt-2 text-coffee-400">Start tracking your usage to see insights</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="card animate-slide-up hover:shadow-2xl hover:bg-white/90 transition-all duration-500" style={{animationDelay: '0.9s'}}>
          <h3 className="text-xl font-semibold text-coffee-900 mb-6 hover:text-caramel-700 transition-colors duration-300">Personalized Recommendations</h3>
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className="recommendation-card hover-lift group cursor-pointer"
                style={{animationDelay: `${1 + index * 0.1}s`}}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-coffee-900 mb-2 group-hover:text-caramel-700 transition-colors duration-300">{rec.title}</h4>
                    <p className="text-coffee-600 group-hover:text-coffee-700 transition-colors duration-300">{rec.message}</p>
                  </div>
                  {rec.actionable && (
                    <span className="ml-4 px-3 py-1 text-xs bg-gradient-to-r from-caramel-200 to-caramel-300 text-coffee-800 rounded-full font-medium hover:from-caramel-300 hover:to-caramel-400 transition-all duration-300 hover:scale-105">
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
