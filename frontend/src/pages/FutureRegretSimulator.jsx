import { useState, useEffect, useMemo } from 'react';
import { usageAPI, analyticsAPI } from '../services/api';
import { analyzeRegretPatterns, generateFutureLetter, generateRegretList } from '../utils/regretAnalysis';
import { calculateDigitalHonestyScore } from '../utils/digitalHonestyScore';
import { formatMinutesToHours } from '../utils/timeFormatter';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const FutureRegretSimulator = () => {
  const [entries, setEntries] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usageResponse, analyticsResponse] = await Promise.all([
        usageAPI.getAll({ limit: 1000 }),
        analyticsAPI.getDashboard()
      ]);
      setEntries(usageResponse.data.data.logs || []);
      setDashboardData(analyticsResponse.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const analysis = useMemo(() => {
    if (!entries.length || !dashboardData) return null;

    // Calculate metrics
    const entriesWithIntention = entries.filter(e => e.intention && e.foundIt !== null);
    const intentDriftFrequency = entriesWithIntention.length > 0
      ? entriesWithIntention.filter(e => e.foundIt === false).length / entriesWithIntention.length
      : 0;

    // Calculate late-night frequency
    // Use createdAt timestamp if available
    const lateNightCount = entries.filter(entry => {
      if (entry.createdAt) {
        const date = new Date(entry.createdAt);
        const hour = date.getHours();
        return hour >= 22 || hour < 6;
      }
      return false;
    }).length;
    const lateNightFrequency = entries.length > 0 ? lateNightCount / entries.length : 0;

    const dailyAvg = dashboardData.weekly?.averageDailyMinutes || 0;
    const riskScoreTrend = dashboardData.weekly?.trend === 'increasing' ? 'increasing' : 
                          dashboardData.riskScore?.score > 60 ? 'stable_high' : 'stable';
    const honestyScore = calculateDigitalHonestyScore(entries);

    const regretData = analyzeRegretPatterns({
      entries,
      dailyAvg,
      lateNightFrequency,
      intentDriftFrequency,
      riskScoreTrend,
      honestyScore
    });

    const letter = generateFutureLetter(regretData, {
      dailyAvg,
      totalDays: entries.length > 0 ? new Set(entries.map(e => e.date)).size : 0,
      lateNightFrequency,
      intentDriftFrequency,
      repeatedOpens: 0 // Could calculate this if needed
    });

    const regretList = generateRegretList(regretData, {
      dailyAvg,
      lateNightFrequency,
      intentDriftFrequency,
      repeatedOpens: 0
    });

    return {
      ...regretData,
      letter,
      regretList,
      stats: {
        dailyAvg,
        lateNightFrequency,
        intentDriftFrequency,
        honestyScore
      }
    };
  }, [entries, dashboardData]);

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
        <button onClick={fetchData} className="btn-primary mt-4">
          Retry
        </button>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="card">
        <div className="text-center py-8 text-gray-600 dark:text-gray-400">
          Not enough data to generate regret analysis. Start tracking your usage to see insights.
        </div>
      </div>
    );
  }

  const chartData = [
    { name: 'Low', value: analysis.regretScore < 40 ? analysis.regretScore : 0, color: '#10b981' },
    { name: 'Medium', value: analysis.regretScore >= 40 && analysis.regretScore < 70 ? analysis.regretScore : 0, color: '#f59e0b' },
    { name: 'High', value: analysis.regretScore >= 70 ? analysis.regretScore : 0, color: '#ef4444' }
  ].filter(item => item.value > 0);

  const getRegretColor = (level) => {
    switch (level) {
      case 'high': return 'text-red-600 dark:text-red-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-green-600 dark:text-green-400';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Future Regret Simulator</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Reflect on the long-term impact of your current digital habits
        </p>
      </div>

      {/* Regret Probability Chart */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Regret Probability</h2>
        <div className="mb-4">
          <div className="flex items-center space-x-4">
            <div className={`text-4xl font-bold ${getRegretColor(analysis.regretLevel)}`}>
              {analysis.regretScore}%
            </div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    analysis.regretLevel === 'high' ? 'bg-red-500' :
                    analysis.regretLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  } transition-all duration-300`}
                  style={{ width: `${analysis.regretScore}%` }}
                />
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Based on your current usage patterns: <span className="font-medium capitalize">{analysis.regretLevel} regret risk</span>
          </p>
        </div>
        {chartData.length > 0 && (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="value">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Letter from 30-Year-Old Self */}
      <div className="card bg-gray-50 dark:bg-gray-800/50">
        <h2 className="text-xl font-semibold mb-4">Letter from Your Future Self</h2>
        <div className="prose dark:prose-invert max-w-none">
          <div className="whitespace-pre-line text-gray-700 dark:text-gray-300 leading-relaxed">
            {analysis.letter}
          </div>
        </div>
      </div>

      {/* Things You Wish You Stopped Earlier */}
      <div className="card border-l-4 border-orange-500 dark:border-orange-600">
        <h2 className="text-xl font-semibold mb-4">Things You Wish You Stopped Earlier</h2>
        <ul className="space-y-3">
          {analysis.regretList.map((item, index) => (
            <li key={index} className="flex items-start">
              <span className="text-orange-500 dark:text-orange-400 mr-2">•</span>
              <span className="text-gray-700 dark:text-gray-300">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Current Stats Reference */}
      <div className="card bg-blue-50 dark:bg-blue-900/10">
        <h3 className="text-lg font-semibold mb-3">Your Current Patterns</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-600 dark:text-gray-400">Daily Average</p>
            <p className="font-semibold">{formatMinutesToHours(analysis.stats.dailyAvg)}</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Late-Night Usage</p>
            <p className="font-semibold">{Math.round(analysis.stats.lateNightFrequency * 100)}%</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Intent Drift</p>
            <p className="font-semibold">{Math.round(analysis.stats.intentDriftFrequency * 100)}%</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Honesty Score</p>
            <p className="font-semibold">{analysis.stats.honestyScore}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};
