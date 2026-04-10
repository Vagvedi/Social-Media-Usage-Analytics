import { useMemo } from 'react';
import { calculateDigitalHonestyScore } from '../utils/digitalHonestyScore';

export const DigitalHonestyScore = ({ entries }) => {
  const score = useMemo(() => {
    return calculateDigitalHonestyScore(entries);
  }, [entries]);

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Digital Honesty Score</h3>
      <div className="flex items-center space-x-4 mb-3">
        <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
          {score}%
        </div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full ${getScoreBgColor(score)} transition-all duration-300`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        You are consistently tracking your usage.
      </p>
    </div>
  );
};
