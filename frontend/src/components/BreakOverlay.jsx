import { useState, useEffect } from 'react';

export const BreakOverlay = ({ isVisible, onResume, breakDuration = 5 }) => {
  const [timeLeft, setTimeLeft] = useState(breakDuration * 60);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      setTimeLeft(breakDuration * 60);
    }
  }, [isVisible, breakDuration]);

  useEffect(() => {
    if (isVisible && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((breakDuration * 60 - timeLeft) / (breakDuration * 60)) * 100;

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className={`bg-white dark:bg-gray-800 rounded-3xl p-12 max-w-md w-full mx-4 transform transition-all duration-500 ${
        isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        <div className="text-center">
          {/* Animated Coffee Cup */}
          <div className="mb-8 relative">
            <div className="text-8xl animate-bounce">☕</div>
            <div className="absolute -top-2 -right-2 text-2xl animate-pulse">✨</div>
          </div>

          {/* Break Title */}
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Break Time! 🎉
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Time to recharge your brain. You've earned this break!
          </p>

          {/* Timer Circle */}
          <div className="relative mb-8">
            <div className="w-48 h-48 mx-auto relative">
              <svg className="transform -rotate-90 w-full h-full">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 88}`}
                  strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
                  className="text-orange-500 transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-4xl font-bold text-orange-500">
                  {formatTime(timeLeft)}
                </div>
              </div>
            </div>
          </div>

          {/* Break Tips */}
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 mb-6">
            <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">
              💡 Quick Tip: Stretch your arms, look away from the screen, and take a few deep breaths!
            </p>
          </div>

          {/* Resume Button */}
          <button
            onClick={onResume}
            className="w-full px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold text-lg transform transition-all duration-200 hover:scale-105 hover:from-orange-600 hover:to-orange-700 shadow-lg"
          >
            {timeLeft > 0 ? `Resume Early (${formatTime(timeLeft)} left)` : 'Resume Now ✨'}
          </button>

          {/* Auto-resume message */}
          {timeLeft > 0 && (
            <p className="text-sm text-gray-500 mt-4">
              Auto-resuming in {formatTime(timeLeft)}...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
