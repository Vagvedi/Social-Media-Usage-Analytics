import { useState, useEffect, useMemo } from 'react';
import { usageAPI } from '../services/api';
import { analyzeMirrorPatterns } from '../utils/mirrorLogic';

export const DigitalMirrorMode = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const insights = useMemo(() => {
    return analyzeMirrorPatterns(entries);
  }, [entries]);

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
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

  const entriesWithIntention = entries.filter(e => e.intention && e.foundIt !== null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Digital Mirror Mode</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Compare your intention vs actual usage behavior
        </p>
      </div>

      {entriesWithIntention.length === 0 ? (
        <div className="card">
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No intention data available yet.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Start tracking your intentions when adding usage entries to see mirror insights here.
            </p>
          </div>
        </div>
      ) : insights.length === 0 ? (
        <div className="card">
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">
              Your usage patterns look intentional. Keep tracking to see insights.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div
              key={index}
              className="card border-l-4 border-red-500 dark:border-red-600 bg-red-50 dark:bg-red-900/10"
            >
              <div className="space-y-2">
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Mirror Insight
                </p>
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                  {insight.message}
                </p>
                {insight.lateNightCount > 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                    {insight.lateNightCount} of these sessions occurred late at night.
                  </p>
                )}
                {insight.repeatedOpens > 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                    You opened the same app multiple times on {insight.repeatedOpens} days.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card bg-gray-50 dark:bg-gray-800/50">
        <h3 className="text-lg font-semibold mb-2">About Digital Mirror Mode</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          This feature compares what you intended to do with what actually happened. 
          It helps you see patterns where your intentions don't match your outcomes, 
          revealing moments of autopilot scrolling or unfulfilled searches.
        </p>
      </div>
    </div>
  );
};
