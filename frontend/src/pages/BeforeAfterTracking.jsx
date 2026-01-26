import { useState, useEffect, useMemo } from 'react';
import { usageAPI } from '../services/api';
import { calculateBeforeAfter } from '../utils/beforeAfterAnalysis';
import { formatMinutesToHours } from '../utils/timeFormatter';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

export const BeforeAfterTracking = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [daysToCompare, setDaysToCompare] = useState(7);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const response = await usageAPI.getAll({ limit: 1000 });
      setEntries(response.data.data.logs || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load usage entries');
    } finally {
      setLoading(false);
    }
  };

  const comparison = useMemo(() => {
    return calculateBeforeAfter(entries, daysToCompare);
  }, [entries, daysToCompare]);

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
        <button onClick={fetchEntries} className="btn-primary mt-4">
          Retry
        </button>
      </div>
    );
  }

  if (!comparison) {
    return (
      <div className="card">
        <div className="text-center py-8 text-gray-600 dark:text-gray-400">
          Not enough data to compare. You need at least {daysToCompare * 2} days of tracking data.
        </div>
      </div>
    );
  }

  const chartData = [
    {
      metric: 'Daily Usage',
      before: comparison.before.avgDailyMinutes,
      after: comparison.after.avgDailyMinutes
    },
    {
      metric: 'Late-Night %',
      before: comparison.before.lateNightFrequency * 100,
      after: comparison.after.lateNightFrequency * 100
    },
    {
      metric: 'Risk Score',
      before: comparison.before.riskScore,
      after: comparison.after.riskScore
    },
    {
      metric: 'Honesty Score',
      before: comparison.before.honestyScore,
      after: comparison.after.honestyScore
    }
  ];

  const getChangeColor = (change) => {
    if (change > 0) return 'text-red-600 dark:text-red-400';
    if (change < 0) return 'text-green-600 dark:text-green-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const formatChange = (change, isPercentage = false) => {
    const sign = change > 0 ? '+' : '';
    const value = isPercentage ? change.toFixed(1) : Math.abs(change).toFixed(1);
    return `${sign}${value}${isPercentage ? '%' : ''}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Before vs After Tracking</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            See the impact of tracking on your digital habits
          </p>
        </div>
        <div>
          <label className="text-sm font-medium mr-2">Compare first</label>
          <select
            value={daysToCompare}
            onChange={(e) => setDaysToCompare(Number(e.target.value))}
            className="input-field"
          >
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
          </select>
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Usage Comparison</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="metric" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="before" fill="#94a3b8" name="Before Tracking" />
            <Bar dataKey="after" fill="#0ea5e9" name="After Tracking" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Before Tracking */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Before Tracking</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Average Daily Usage</p>
              <p className="text-2xl font-bold">{formatMinutesToHours(comparison.before.avgDailyMinutes)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Late-Night Usage</p>
              <p className="text-2xl font-bold">{Math.round(comparison.before.lateNightFrequency * 100)}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Behavioral Risk Score</p>
              <p className="text-2xl font-bold">{comparison.before.riskScore}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Digital Honesty Score</p>
              <p className="text-2xl font-bold">{comparison.before.honestyScore}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Days Active</p>
              <p className="text-2xl font-bold">{comparison.before.daysActive}</p>
            </div>
          </div>
        </div>

        {/* After Tracking */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">After Tracking</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Average Daily Usage</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold">{formatMinutesToHours(comparison.after.avgDailyMinutes)}</p>
                <span className={`text-sm font-medium ${getChangeColor(comparison.changes.dailyUsage)}`}>
                  ({formatChange(comparison.changes.dailyUsage)})
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Late-Night Usage</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold">{Math.round(comparison.after.lateNightFrequency * 100)}%</p>
                <span className={`text-sm font-medium ${getChangeColor(comparison.changes.lateNightUsage * 100)}`}>
                  ({formatChange(comparison.changes.lateNightUsage * 100, true)})
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Behavioral Risk Score</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold">{comparison.after.riskScore}</p>
                <span className={`text-sm font-medium ${getChangeColor(comparison.changes.riskScore)}`}>
                  ({formatChange(comparison.changes.riskScore)})
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Digital Honesty Score</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold">{comparison.after.honestyScore}%</p>
                <span className={`text-sm font-medium ${getChangeColor(-comparison.changes.honestyScore)}`}>
                  ({formatChange(-comparison.changes.honestyScore)})
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Days Active</p>
              <p className="text-2xl font-bold">{comparison.after.daysActive}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="card bg-gray-50 dark:bg-gray-800/50">
        <h3 className="text-lg font-semibold mb-3">Summary</h3>
        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <p>
            Comparing your first {comparison.daysCompared} days of tracking with your most recent {comparison.daysCompared} days:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            {comparison.changes.dailyUsage < 0 && (
              <li>Your daily usage decreased by {formatMinutesToHours(Math.abs(comparison.changes.dailyUsage))}</li>
            )}
            {comparison.changes.dailyUsage > 0 && (
              <li>Your daily usage increased by {formatMinutesToHours(comparison.changes.dailyUsage)}</li>
            )}
            {comparison.changes.lateNightUsage < 0 && (
              <li>Late-night usage decreased by {formatChange(Math.abs(comparison.changes.lateNightUsage) * 100, true)}</li>
            )}
            {comparison.changes.lateNightUsage > 0 && (
              <li>Late-night usage increased by {formatChange(comparison.changes.lateNightUsage * 100, true)}</li>
            )}
            {comparison.changes.riskScore < 0 && (
              <li>Your behavioral risk score improved by {Math.abs(comparison.changes.riskScore)} points</li>
            )}
            {comparison.changes.riskScore > 0 && (
              <li>Your behavioral risk score increased by {comparison.changes.riskScore} points</li>
            )}
            {comparison.changes.honestyScore > 0 && (
              <li>Your digital honesty score improved by {Math.round(comparison.changes.honestyScore)} points</li>
            )}
            {comparison.changes.honestyScore < 0 && (
              <li>Your digital honesty score decreased by {Math.abs(Math.round(comparison.changes.honestyScore))} points</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};
