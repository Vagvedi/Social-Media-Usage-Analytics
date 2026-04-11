import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI, usageAPI, studyAPI } from '../services/api';
import { UsageEntry } from '../components/UsageEntry';
import { UsageHistory } from '../components/UsageHistory';
import { DigitalHonestyScore } from '../components/DigitalHonestyScore';
import { StudyCalendar } from '../components/StudyCalendar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { formatMinutesToHours } from '../utils/timeFormatter';
import { calculateBeforeAfter } from '../utils/beforeAfterAnalysis';
import { analyzeRegretPatterns, generateFutureLetter, generateRegretList } from '../utils/regretAnalysis';
import { calculateDigitalHonestyScore } from '../utils/digitalHonestyScore';

// Alexandria-style colors - soft, minimal
const CHART_COLORS = {
  primary: '#5a7fff',
  secondary: '#94a3b8',
  accent: '#d97706',
  muted: '#e2e8f0',
  success: '#059669',
  warning: '#d97706',
  danger: '#dc2626'
};

const PIE_COLORS = ['#5a7fff', '#94a3b8', '#d97706', '#059669', '#ec4899'];

export const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [usageEntries, setUsageEntries] = useState([]);
  const [studyData, setStudyData] = useState(null);
  const [studySessions, setStudySessions] = useState([]);
  const [studyGoals, setStudyGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState('analytics');
  const [daysToCompare, setDaysToCompare] = useState(7);
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [mirrorInput, setMirrorInput] = useState({ intention: '', actual: '' });
  const [regretInput, setRegretInput] = useState({ dailyHours: 2, years: 5 });

  useEffect(() => {
    fetchAllData();
  }, [refreshKey]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchDashboardData(),
        fetchUsageEntries(),
        fetchStudyData(),
        fetchStudySessions(),
        fetchStudyGoals()
      ]);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudyData = async () => {
    try {
      const response = await studyAPI.getAnalytics({ period: 'week' });
      setStudyData(response.data.data);
    } catch (err) {
      console.error('Failed to load study data:', err);
    }
  };

  const fetchStudySessions = async () => {
    try {
      const response = await studyAPI.getSessions();
      const sessionsData = response.data?.data;
      // Ensure sessions is always an array
      setStudySessions(Array.isArray(sessionsData) ? sessionsData : []);
    } catch (err) {
      console.error('Failed to load study sessions:', err);
      setStudySessions([]);
    }
  };

  const fetchStudyGoals = async () => {
    try {
      const response = await studyAPI.getGoals();
      const goalsData = response.data?.data;
      // Ensure goals is always an array
      setStudyGoals(Array.isArray(goalsData) ? goalsData : []);
    } catch (err) {
      console.error('Failed to load study goals:', err);
      setStudyGoals([]);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await analyticsAPI.getDashboard();
      setDashboardData(response.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
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
  };

  const analyzeMirrorPattern = () => {
    if (!mirrorInput.intention || !mirrorInput.actual) return;
    const drift = mirrorInput.intention.toLowerCase().includes('study') && 
                  !mirrorInput.actual.toLowerCase().includes('study');
    return {
      drift,
      message: drift 
        ? `📊 Intention drift detected! Planned: "${mirrorInput.intention}" vs Actual: "${mirrorInput.actual}"`
        : `✅ Good alignment! Intention: "${mirrorInput.intention}" matches activity: "${mirrorInput.actual}"`
    };
  };

  const calculateRegretImpact = () => {
    const totalHours = regretInput.dailyHours * 365 * regretInput.years;
    const totalDays = totalHours / 24;
    const totalYears = totalHours / (365 * 24);
    return { totalHours, totalDays, totalYears };
  };

  // Calculate real momentum data from study sessions
  const momentumData = useMemo(() => {
    if (!studySessions.length) return [];
    
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    
    return days.map((day, index) => {
      const date = addDays(weekStart, index);
      const daySessions = studySessions.filter(session => {
        const sessionDate = new Date(session.startTime);
        return isSameDay(sessionDate, date);
      });
      
      const hours = daySessions.reduce((total, session) => {
        const duration = session.duration || 
          ((new Date(session.endTime) - new Date(session.startTime)) / (1000 * 60 * 60));
        return total + duration;
      }, 0);
      
      return { day, hours: Math.round(hours * 10) / 10 };
    });
  }, [studySessions]);

  // Calculate mini chart data for Concept Mastery - ONLY real data
  const conceptMasteryData = useMemo(() => {
    if (!studySessions.length) return [];
    
    const scores = studySessions
      .slice(-6)
      .map(s => {
        if (s.focusScore !== undefined && s.focusScore !== null) return parseFloat(s.focusScore);
        if (s.productivity === 'high') return 80;
        if (s.productivity === 'medium') return 60;
        if (s.productivity === 'low') return 40;
        return null;
      })
      .filter(s => s !== null);
    
    return scores;
  }, [studySessions]);

  // Before/After Analysis
  const beforeAfterComparison = useMemo(() => {
    if (!usageEntries.length) return null;
    return calculateBeforeAfter(usageEntries, daysToCompare);
  }, [usageEntries, daysToCompare]);

  // Future Regret Analysis
  const regretAnalysis = useMemo(() => {
    if (!usageEntries.length || !dashboardData) return null;
    
    const entriesWithIntention = usageEntries.filter(e => e.intention && e.foundIt !== null);
    const intentDriftFrequency = entriesWithIntention.length > 0
      ? entriesWithIntention.filter(e => e.foundIt === false).length / entriesWithIntention.length
      : 0;

    const lateNightCount = usageEntries.filter(entry => {
      if (entry.createdAt) {
        const date = new Date(entry.createdAt);
        const hour = date.getHours();
        return hour >= 22 || hour < 6;
      }
      return false;
    }).length;
    const lateNightFrequency = usageEntries.length > 0 ? lateNightCount / usageEntries.length : 0;

    const dailyAvg = dashboardData.weekly?.averageDailyMinutes || 0;
    const riskScoreTrend = dashboardData.weekly?.trend === 'increasing' ? 'increasing' : 
                          dashboardData.riskScore?.score > 60 ? 'stable_high' : 'stable';
    const honestyScore = calculateDigitalHonestyScore(usageEntries);

    const regretData = analyzeRegretPatterns({
      entries: usageEntries,
      dailyAvg,
      lateNightFrequency,
      intentDriftFrequency,
      riskScoreTrend,
      honestyScore
    });

    return {
      ...regretData,
      letter: generateFutureLetter(regretData, {
        dailyAvg,
        totalDays: usageEntries.length > 0 ? new Set(usageEntries.map(e => e.date)).size : 0,
        lateNightFrequency,
        intentDriftFrequency,
        repeatedOpens: 0
      }),
      regretList: generateRegretList(regretData, {
        dailyAvg,
        lateNightFrequency,
        intentDriftFrequency,
        repeatedOpens: 0
      }),
      stats: { dailyAvg, lateNightFrequency, intentDriftFrequency, honestyScore }
    };
  }, [usageEntries, dashboardData]);

  // Digital Mirror Insights
  const digitalMirrorInsights = useMemo(() => {
    const combinedEntries = [
      ...studySessions.map(session => ({
        id: session.id,
        type: 'session',
        intended: session.subject || 'Study Session',
        actual: session.subject || 'Study Session',
        duration: session.duration || ((new Date(session.endTime) - new Date(session.startTime)) / (1000 * 60)),
        startTime: session.startTime,
        endTime: session.endTime,
        breaksTaken: session.breaksTaken || 0,
        completed: session.isCompleted || false,
      })),
      ...studyGoals.map(goal => ({
        id: goal.id,
        type: 'goal',
        intended: goal.subject || 'Study Goal',
        actual: goal.subject || 'Study Goal',
        targetHours: goal.targetHours || 0,
        currentHours: goal.currentHours || 0,
        deadline: goal.deadline,
        priority: goal.priority || 'medium',
        status: goal.status || 'pending',
        completed: goal.status === 'completed',
      }))
    ];

    const insights = [];
    
    // Incomplete sessions
    const incompleteSessions = combinedEntries.filter(e => e.type === 'session' && !e.completed);
    if (incompleteSessions.length > 0) {
      insights.push({
        type: 'incomplete_sessions',
        message: `You have ${incompleteSessions.length} incomplete study sessions. Consider setting smaller, achievable goals.`,
        count: incompleteSessions.length,
        percentage: (incompleteSessions.length / combinedEntries.filter(e => e.type === 'session').length) * 100
      });
    }

    // Incomplete goals
    const incompleteGoals = combinedEntries.filter(e => e.type === 'goal' && !e.completed);
    if (incompleteGoals.length > 0) {
      insights.push({
        type: 'incomplete_goals',
        message: `${incompleteGoals.length} goals are still in progress. Keep pushing forward!`,
        count: incompleteGoals.length
      });
    }

    // Short sessions
    const shortSessions = combinedEntries.filter(e => e.type === 'session' && e.duration < 20);
    if (shortSessions.length > 0) {
      insights.push({
        type: 'short_sessions',
        message: `${shortSessions.length} sessions were under 20 minutes. Try extending your focus periods.`,
        count: shortSessions.length,
        averageDuration: Math.round(shortSessions.reduce((sum, s) => sum + s.duration, 0) / shortSessions.length)
      });
    }

    // Overdue goals
    const now = new Date();
    const overdueGoals = studyGoals.filter(goal => new Date(goal.deadline) < now && goal.status !== 'completed');
    if (overdueGoals.length > 0) {
      insights.push({
        type: 'overdue_goals',
        message: `${overdueGoals.length} goals are past their deadline. Consider revising your timeline.`,
        count: overdueGoals.length
      });
    }

    if (insights.length === 0 && combinedEntries.length > 0) {
      insights.push({
        type: 'no_data',
        message: 'Your study patterns look great! Keep up the consistent work.'
      });
    }

    return insights;
  }, [studySessions, studyGoals]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="clean-card p-8 max-w-md mx-auto mt-20">
        <div className="text-red-500 text-sm">{error}</div>
        <button onClick={fetchAllData} className="btn-primary mt-4 w-full">
          Retry
        </button>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const { daily, weekly, monthly, riskScore, topApps, recommendations, charts } = dashboardData;

  // Top apps data for pie chart
  const topAppsData = topApps?.map((app, index) => ({
    name: app.name,
    value: app.minutes,
    color: PIE_COLORS[index % PIE_COLORS.length]
  })) || [];

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start justify-between">
            <div className="max-w-lg">
              <h1 className="hero-title">Focus on the craft of learning.</h1>
              <p className="hero-subtitle">
                COGNIFY helps you curate your digital attention and transform scattered study habits into a disciplined intellectual journey.
              </p>
            </div>
            <Link to="/study-hub" className="btn-primary mt-4">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
              </svg>
              Start Session
            </Link>
          </div>
        </div>
      </section>

      {/* Pill Tabs */}
      <div className="max-w-6xl mx-auto px-8 -mt-4 mb-8">
        <div className="pill-tabs">
          <button
            className={`pill-tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
          <button
            className={`pill-tab ${activeTab === 'progress' ? 'active' : ''}`}
            onClick={() => setActiveTab('progress')}
          >
            Progress
          </button>
          <button
            className={`pill-tab ${activeTab === 'tracking' ? 'active' : ''}`}
            onClick={() => setActiveTab('tracking')}
          >
            Study Tracking
          </button>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-6xl mx-auto px-8 pb-12">
        {/* Metric Cards Row - Always visible */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Deep Work Hours */}
          <div className="metric-card">
            <div>
              <div className="metric-label">Deep Work Hours</div>
              <div className="metric-value">
                {studyData ? parseFloat(studyData.totalHours || 0).toFixed(1) : '0.0'}
              </div>
              <div className="clean-progress mt-3">
                <div 
                  className="clean-progress-bar" 
                  style={{ width: `${Math.min((studyData?.totalHours || 0) / 40 * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="metric-trend up">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              <span>+{studyData?.studyStreak || 0} day streak</span>
            </div>
          </div>

          {/* Concept Mastery */}
          <div className="metric-card">
            <div>
              <div className="metric-label">Concept Mastery</div>
              <div className="metric-value">
                {studyData ? `${Math.round(studyData.averageFocusScore || 0)}%` : '0%'}
              </div>
              <div className="flex items-end gap-1 mt-3 h-6">
                {conceptMasteryData.length > 0 ? conceptMasteryData.map((h, i) => (
                  <div
                    key={i}
                    className="w-3 rounded-sm"
                    style={{
                      height: `${Math.min(Math.max(h, 0), 100)}%`,
                      backgroundColor: h > 60 ? CHART_COLORS.primary : CHART_COLORS.secondary
                    }}
                  />
                )) : (
                  <span className="text-xs text-gray-400">No focus data yet</span>
                )}
              </div>
            </div>
            <div className="metric-trend up">
              <span>{studyData?.totalSessions || 0} sessions</span>
            </div>
          </div>

          {/* Social Velocity */}
          <div className="metric-card">
            <div>
              <div className="metric-label">Social Velocity</div>
              <div className="metric-value" style={{ color: riskScore.level === 'high' ? '#dc2626' : '#059669' }}>
                {riskScore.level === 'high' ? 'High' : riskScore.level === 'moderate' ? 'Moderate' : 'Low'}
              </div>
              <div className="text-xs text-gray-400 mt-3">
                {formatMinutesToHours(daily.totalMinutes)} today
              </div>
            </div>
            <div className="metric-trend" style={{ color: riskScore.level === 'high' ? '#dc2626' : '#059669' }}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={riskScore.level === 'high' ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M19 14l-7 7m0 0l-7-7m7 7V3'} />
              </svg>
              <span>{riskScore.level === 'high' ? 'Take a break' : 'On track'}</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid - Always visible overview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* Left: Intellectual Momentum (Bar Chart) - REAL DATA */}
          <div className="lg:col-span-5">
            <div className="clean-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-editorial text-lg font-semibold text-gray-900">Intellectual Momentum</h3>
                <span className="clean-badge blue">Weekly</span>
              </div>
              <div className="h-48">
                {momentumData.length > 0 && momentumData.some(d => d.hours > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={momentumData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis
                        dataKey="day"
                        stroke="#94a3b8"
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                        }}
                        formatter={(value) => [`${value}h`, 'Study Hours']}
                      />
                      <Bar
                        dataKey="hours"
                        fill={CHART_COLORS.primary}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                    No study sessions yet. Start tracking in Study Hub!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Center: Academic Calendar */}
          <div className="lg:col-span-4">
            <div className="clean-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-editorial text-lg font-semibold text-gray-900">Academic Calendar</h3>
                <Link to="/study-hub?tab=calendar" className="text-sm text-blue-600 hover:text-blue-700">
                  View All
                </Link>
              </div>
              <StudyCalendar compact />
              {studyGoals.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">Active Goals: {studyGoals.filter(g => g.status !== 'completed').length}</p>
                  <div className="flex flex-wrap gap-1">
                    {studyGoals.slice(0, 3).map(goal => (
                      <span key={goal.id} className="clean-badge blue text-xs">
                        {goal.subject}
                      </span>
                    ))}
                    {studyGoals.length > 3 && (
                      <span className="clean-badge gray text-xs">+{studyGoals.length - 3}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Curator's Insights */}
          <div className="lg:col-span-3">
            <div className="insights-card">
              <div className="insights-title">
                <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                Curator's Insights
              </div>
              {recommendations && recommendations.length > 0 ? (
                <>
                  <p className="insights-quote">"{recommendations[0].message}"</p>
                  <div className="insights-meta">{recommendations[0].title}</div>
                  {recommendations[1] && (
                    <>
                      <div className="border-t border-gray-200 my-4"></div>
                      <p className="insights-quote">"{recommendations[1].message}"</p>
                      <div className="insights-meta">{recommendations[1].title}</div>
                    </>
                  )}
                </>
              ) : (
                <>
                  <p className="insights-quote">"Start tracking your usage to receive personalized insights about your digital habits."</p>
                  <div className="insights-meta">COGNIFY AI</div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ==================== ANALYTICS TAB ==================== */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Usage Trend Chart */}
            <div className="clean-card p-6">
              <h3 className="text-editorial text-lg font-semibold text-gray-900 mb-6">Daily Usage Trend</h3>
              <div className="h-64">
                {charts?.daily?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={charts.daily} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                        stroke="#94a3b8"
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        axisLine={false}
                      />
                      <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                        }}
                        formatter={(value) => [formatMinutesToHours(value), 'Usage']}
                      />
                      <Line
                        type="monotone"
                        dataKey="minutes"
                        stroke={CHART_COLORS.primary}
                        strokeWidth={2}
                        dot={{ fill: CHART_COLORS.primary, r: 3, strokeWidth: 0 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No usage data available. Start tracking!
                  </div>
                )}
              </div>
            </div>

            {/* Top Apps Pie Chart */}
            {topAppsData.length > 0 && (
              <div className="clean-card p-6">
                <h3 className="text-editorial text-lg font-semibold text-gray-900 mb-6">Top Apps</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={topAppsData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {topAppsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatMinutesToHours(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Risk Assessment */}
            <div className="clean-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-editorial text-lg font-semibold text-gray-900">Risk Assessment</h3>
                <span className={`clean-badge ${riskScore?.level === 'low' ? 'green' : riskScore?.level === 'moderate' ? 'amber' : 'red'}`}>
                  {riskScore?.category || 'Low'} Risk
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-3xl font-semibold text-gray-900">{riskScore?.score || 0}</div>
                <div className="flex-1">
                  <div className="clean-progress">
                    <div
                      className="clean-progress-bar"
                      style={{
                        width: `${riskScore?.score || 0}%`,
                        backgroundColor: riskScore?.level === 'low' ? '#059669' : riskScore?.level === 'moderate' ? '#d97706' : '#dc2626'
                      }}
                    />
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-3">{riskScore?.message || 'Keep tracking to see your risk assessment.'}</p>
            </div>

            {/* BEFORE/AFTER REGRET SIMULATOR */}
            {beforeAfterComparison && (
              <div className="clean-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-editorial text-lg font-semibold text-gray-900">Before vs After Tracking</h3>
                  <select
                    value={daysToCompare}
                    onChange={(e) => setDaysToCompare(Number(e.target.value))}
                    className="clean-select text-sm"
                  >
                    <option value={7}>Last 7 days</option>
                    <option value={14}>Last 14 days</option>
                    <option value={30}>Last 30 days</option>
                  </select>
                </div>
                
                <div className="h-64 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { metric: 'Daily Usage', before: beforeAfterComparison.before.avgDailyMinutes, after: beforeAfterComparison.after.avgDailyMinutes },
                      { metric: 'Late-Night %', before: beforeAfterComparison.before.lateNightFrequency * 100, after: beforeAfterComparison.after.lateNightFrequency * 100 },
                      { metric: 'Risk Score', before: beforeAfterComparison.before.riskScore, after: beforeAfterComparison.after.riskScore },
                      { metric: 'Honesty Score', before: beforeAfterComparison.before.honestyScore, after: beforeAfterComparison.after.honestyScore }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="metric" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="before" fill={CHART_COLORS.secondary} name="Before" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="after" fill={CHART_COLORS.primary} name="After" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Usage Change</p>
                    <p className={`text-lg font-semibold ${beforeAfterComparison.changes.dailyUsage <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {beforeAfterComparison.changes.dailyUsage > 0 ? '+' : ''}{formatMinutesToHours(Math.abs(beforeAfterComparison.changes.dailyUsage))}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Risk Change</p>
                    <p className={`text-lg font-semibold ${beforeAfterComparison.changes.riskScore <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {beforeAfterComparison.changes.riskScore > 0 ? '+' : ''}{beforeAfterComparison.changes.riskScore.toFixed(1)}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Late Night Change</p>
                    <p className={`text-lg font-semibold ${beforeAfterComparison.changes.lateNightUsage <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {beforeAfterComparison.changes.lateNightUsage > 0 ? '+' : ''}{(beforeAfterComparison.changes.lateNightUsage * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Honesty Change</p>
                    <p className={`text-lg font-semibold ${beforeAfterComparison.changes.honestyScore >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {beforeAfterComparison.changes.honestyScore > 0 ? '+' : ''}{beforeAfterComparison.changes.honestyScore.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* FUTURE REGRET SIMULATOR WITH USER INPUT */}
            <div className="clean-card p-6">
              <h3 className="text-editorial text-lg font-semibold text-gray-900 mb-4">Future Regret Simulator</h3>
              
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-3">Simulate your future based on current habits:</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Daily Usage (hours)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={regretInput.dailyHours}
                      onChange={(e) => setRegretInput({...regretInput, dailyHours: parseFloat(e.target.value) || 0})}
                      className="clean-input text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Years to Simulate</label>
                    <select 
                      className="clean-select text-sm"
                      value={regretInput.years}
                      onChange={(e) => setRegretInput({...regretInput, years: parseInt(e.target.value) || 5})}
                    >
                      <option value={1}>1 Year</option>
                      <option value={5}>5 Years</option>
                      <option value={10}>10 Years</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button 
                      onClick={() => {
                        const result = calculateRegretImpact();
                        alert(`In ${regretInput.years} years, at ${regretInput.dailyHours}h/day:\n\nYou'll spend ${Math.round(result.totalDays)} days (${result.totalYears.toFixed(1)} years) on social media.\n\nThat's ${result.totalHours.toFixed(0)} hours of your life.`);
                      }}
                      className="btn-secondary text-sm w-full"
                    >
                      Calculate Impact
                    </button>
                  </div>
                </div>
              </div>

              {regretAnalysis && (
                <>
                  {/* Regret Score */}
                  <div className="mb-6 p-4 border-l-4 border-rose-400 bg-rose-50 rounded-r-xl">
                    <div className="flex items-center gap-4">
                      <div className={`text-3xl font-bold ${regretAnalysis.regretLevel === 'high' ? 'text-rose-600' : regretAnalysis.regretLevel === 'medium' ? 'text-amber-600' : 'text-green-600'}`}>
                        {regretAnalysis.regretScore}%
                      </div>
                      <div className="flex-1">
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${regretAnalysis.regretLevel === 'high' ? 'bg-rose-500' : regretAnalysis.regretLevel === 'medium' ? 'bg-amber-500' : 'bg-green-500'}`}
                            style={{ width: `${regretAnalysis.regretScore}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Based on current patterns: <span className="font-medium capitalize">{regretAnalysis.regretLevel} regret risk</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Letter from Future Self */}
                  <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <span>✉️</span> Letter from Your Future Self
                    </h4>
                    <div className="whitespace-pre-line text-gray-700 text-sm leading-relaxed">
                      {regretAnalysis.letter}
                    </div>
                  </div>

                  {/* Things to Stop */}
                  {regretAnalysis.regretList.length > 0 && (
                    <div className="p-4 border-l-4 border-pink-400 bg-pink-50 rounded-r-xl">
                      <h4 className="font-semibold text-gray-900 mb-2">Things You Might Regret</h4>
                      <ul className="space-y-2">
                        {regretAnalysis.regretList.map((item, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <span className="text-rose-500 mt-0.5">•</span>
                            <span className="text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* DIGITAL MIRROR WITH USER INPUT */}
            <div className="clean-card p-6">
              <h3 className="text-editorial text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>🪞</span> Digital Mirror: Intention vs Reality
              </h3>
              
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-3">Log your intention and outcome:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">What did you intend to do?</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Study for 2 hours"
                      className="clean-input text-sm"
                      value={mirrorInput.intention}
                      onChange={(e) => setMirrorInput({...mirrorInput, intention: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">What actually happened?</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Scrolled Instagram for 1 hour"
                      className="clean-input text-sm"
                      value={mirrorInput.actual}
                      onChange={(e) => setMirrorInput({...mirrorInput, actual: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      const result = analyzeMirrorPattern();
                      if (result) {
                        alert(result.message);
                        setMirrorInput({ intention: '', actual: '' });
                      }
                    }}
                    className="btn-primary text-sm"
                  >
                    Analyze Pattern
                  </button>
                </div>
              </div>

              {/* Auto-generated Insights from Real Data */}
              {digitalMirrorInsights.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {digitalMirrorInsights.map((insight, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedInsight(insight)}
                      className="p-4 bg-gray-50 hover:bg-gray-100 rounded-xl cursor-pointer transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">
                          {insight.type === 'incomplete_sessions' ? '⏰' :
                           insight.type === 'incomplete_goals' ? '🎯' :
                           insight.type === 'short_sessions' ? '📏' :
                           insight.type === 'overdue_goals' ? '⚠️' : '💡'}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm mb-1">
                            {insight.type === 'incomplete_sessions' ? 'Incomplete Sessions' :
                             insight.type === 'incomplete_goals' ? 'Goals In Progress' :
                             insight.type === 'short_sessions' ? 'Short Sessions' :
                             insight.type === 'overdue_goals' ? 'Overdue Goals' : 'Insight'}
                          </h4>
                          <p className="text-xs text-gray-500">{insight.message}</p>
                          {insight.count && (
                            <span className="inline-block mt-2 text-xs bg-white px-2 py-1 rounded-full text-gray-600">
                              {insight.count} items
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ==================== PROGRESS TAB ==================== */}
        {activeTab === 'progress' && (
          <div className="space-y-6">
            {/* Digital Honesty Score */}
            <DigitalHonestyScore entries={usageEntries} />
            
            {/* Study Progress */}
            {studyData && (
              <div className="clean-card p-6">
                <h3 className="text-editorial text-lg font-semibold text-gray-900 mb-6">Study Progress</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-gray-900">{parseFloat(studyData.totalHours || 0).toFixed(1)}h</p>
                    <p className="text-xs text-gray-500 mt-1">Total Hours</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-gray-900">{studyData.totalSessions}</p>
                    <p className="text-xs text-gray-500 mt-1">Sessions</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-gray-900">{studyData.studyStreak}</p>
                    <p className="text-xs text-gray-500 mt-1">Day Streak</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-gray-900">{Math.round(studyData.averageFocusScore)}%</p>
                    <p className="text-xs text-gray-500 mt-1">Focus Score</p>
                  </div>
                </div>
              </div>
            )}

            {/* Goals Progress */}
            {studyGoals.length > 0 && (
              <div className="clean-card p-6">
                <h3 className="text-editorial text-lg font-semibold text-gray-900 mb-6">Goals Progress</h3>
                <div className="space-y-4">
                  {studyGoals.map(goal => {
                    const progress = goal.targetHours > 0 ? (goal.currentHours / goal.targetHours) * 100 : 0;
                    return (
                      <div key={goal.id} className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 text-sm">{goal.subject}</h4>
                          <span className={`clean-badge ${goal.status === 'completed' ? 'green' : goal.status === 'overdue' ? 'red' : 'blue'} text-xs`}>
                            {goal.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                          <span>{parseFloat(goal.currentHours || 0).toFixed(1)}h / {goal.targetHours}h</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="clean-progress h-2">
                          <div 
                            className="clean-progress-bar" 
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== STUDY TRACKING TAB ==================== */}
        {activeTab === 'tracking' && (
          <div className="space-y-6">
            <UsageEntry onSuccess={handleRefresh} />
            <UsageHistory onUpdate={handleRefresh} />
          </div>
        )}
      </div>

      {/* Minimal Footer */}
      <footer className="minimal-footer max-w-6xl mx-auto">
        <div className="footer-brand">COGNIFY</div>
        <div className="footer-links">
          <Link to="/privacy" className="footer-link">Privacy</Link>
          <Link to="/terms" className="footer-link">Terms</Link>
          <Link to="/support" className="footer-link">Support</Link>
        </div>
      </footer>
    </div>
  );
};
