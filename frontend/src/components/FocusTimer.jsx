import { useState, useEffect, useRef } from 'react';

export const FocusTimer = ({ onSessionComplete, isActive, onTimeUpdate, onPause, onResume }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isPaused, setIsPaused] = useState(false);
  const [mode, setMode] = useState('focus'); // 'focus', 'shortBreak', 'longBreak', 'manualPause'
  const [completedSessions, setCompletedSessions] = useState(0);
  const intervalRef = useRef(null);

  const focusTime = 25 * 60; // 25 minutes
  const shortBreak = 5 * 60; // 5 minutes
  const longBreak = 15 * 60; // 15 minutes

  const togglePause = () => {
    if (isPaused) {
      setIsPaused(false);
      setMode('focus');
      onResume && onResume();
    } else {
      setIsPaused(true);
      setMode('manualPause');
      onPause && onPause();
    }
  };

  const resetTimer = () => {
    setTimeLeft(mode === 'focus' ? focusTime : (mode === 'shortBreak' ? shortBreak : longBreak));
    setIsPaused(false);
  };

  const handleTimerComplete = () => {
    const audio = new Audio('/notification.mp3');
    audio.play().catch(() => {}); // Ignore errors if audio file doesn't exist

    if (mode === 'focus') {
      const newCompletedSessions = completedSessions + 1;
      setCompletedSessions(newCompletedSessions);
      
      // Every 4 sessions, take a long break
      if (newCompletedSessions % 4 === 0) {
        setMode('longBreak');
        setTimeLeft(longBreak);
      } else {
        setMode('shortBreak');
        setTimeLeft(shortBreak);
      }
      onSessionComplete && onSessionComplete('focus');
    } else {
      setMode('focus');
      setTimeLeft(focusTime);
      onSessionComplete && onSessionComplete('break');
    }
  };

  useEffect(() => {
    if (isActive && !isPaused && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          onTimeUpdate && onTimeUpdate(focusTime - newTime);
          
          if (newTime === 0) {
            handleTimerComplete();
            return 0;
          }
          return newTime;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive, isPaused, timeLeft, focusTime, onTimeUpdate]);

  // Reset timer when mode changes
  useEffect(() => {
    if (mode === 'focus') {
      setTimeLeft(focusTime);
    } else if (mode === 'shortBreak') {
      setTimeLeft(shortBreak);
    } else if (mode === 'longBreak') {
      setTimeLeft(longBreak);
    }
    setIsPaused(false);
  }, [mode, focusTime, shortBreak, longBreak]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((mode === 'focus' ? focusTime : (mode === 'shortBreak' ? shortBreak : longBreak)) - timeLeft) / 
                   (mode === 'focus' ? focusTime : (mode === 'shortBreak' ? shortBreak : longBreak)) * 100;

  if (!isActive) return null;

  const getTimerColor = () => {
    switch (mode) {
      case 'focus': return 'text-blue-600';
      case 'shortBreak': return 'text-green-600';
      case 'longBreak': return 'text-purple-600';
      case 'manualPause': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getTimerBg = () => {
    switch (mode) {
      case 'focus': return 'bg-blue-50';
      case 'shortBreak': return 'bg-green-50';
      case 'longBreak': return 'bg-purple-50';
      case 'manualPause': return 'bg-orange-50';
      default: return 'bg-gray-50';
    }
  };

  const getTimerIcon = () => {
    switch (mode) {
      case 'focus': return '🎯';
      case 'shortBreak': return '☕';
      case 'longBreak': return '🌟';
      case 'manualPause': return '⏸️';
      default: return '⏱️';
    }
  };

  const getTimerText = () => {
    switch (mode) {
      case 'focus': return 'Focus Time';
      case 'shortBreak': return 'Short Break';
      case 'longBreak': return 'Long Break';
      case 'manualPause': return 'Paused';
      default: return 'Timer';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border-2 border-gray-200 dark:border-gray-700 transform transition-all duration-300 hover:scale-105">
      <div className="text-center">
        {/* Header */}
        <div className="mb-6">
          <h3 className={`text-2xl font-bold mb-2 ${getTimerColor()}`}>
            {getTimerIcon()} {getTimerText()}
          </h3>
          <div className="flex items-center justify-center space-x-2">
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getTimerBg()} ${getTimerColor()}`}>
              {mode === 'focus' && 'Session ' + (completedSessions + 1)}
              {mode === 'shortBreak' && 'Break ' + Math.floor(completedSessions / 4)}
              {mode === 'longBreak' && 'Long Break'}
              {mode === 'manualPause' && 'Paused'}
            </div>
            {mode === 'focus' && (
              <div className="text-sm text-gray-500">
                Every 4 sessions = Long Break
              </div>
            )}
          </div>
        </div>

        {/* Timer Display */}
        <div className="relative mb-8">
          <div className="w-64 h-64 mx-auto relative">
            {/* Animated Background */}
            <div className={`absolute inset-0 rounded-full ${getTimerBg()} transition-all duration-500`} />
            
            {/* Timer Circle */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className={`transition-all duration-1000 ${getTimerColor()}`}
              />
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 120}`}
                strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                className={`transition-all duration-1000 ${getTimerColor()}`}
              />
            </svg>

            {/* Time Display */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`text-5xl font-bold font-mono ${getTimerColor()}`}>
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={togglePause}
            className={`px-8 py-3 rounded-xl font-semibold text-white transform transition-all duration-200 hover:scale-110 ${
              mode === 'focus' 
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800' 
                : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
            }`}
          >
            {mode === 'focus' ? '⏸️ Pause' : '▶️ Resume'}
          </button>
          
          <button
            onClick={resetTimer}
            className="px-8 py-3 rounded-xl font-semibold text-gray-600 bg-gray-200 hover:bg-gray-300 transform transition-all duration-200 hover:scale-110"
          >
            🔄 Reset
          </button>
        </div>

        {/* Status Message */}
        <div className={`mt-6 p-4 rounded-xl ${getTimerBg()} border-2 ${
          mode === 'focus' ? 'border-blue-200' :
          mode === 'shortBreak' ? 'border-green-200' :
          mode === 'manualPause' ? 'border-orange-200' :
          'border-gray-200'
        }`}>
          <p className={`text-sm font-medium ${getTimerColor()}`}>
            {mode === 'focus' && 'Stay focused! No distractions allowed. 🚀'}
            {mode === 'shortBreak' && 'Take a quick break. Stretch and relax. 💆'}
            {mode === 'longBreak' && 'Great job! Take a well-deserved long break. 🌟'}
            {mode === 'manualPause' && 'Timer paused. Click Resume when ready. ⏸️'}
          </p>
        </div>
      </div>
    </div>
  );
};
