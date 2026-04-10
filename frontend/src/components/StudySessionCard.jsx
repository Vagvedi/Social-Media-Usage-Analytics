import { useState } from 'react';

export const StudySessionCard = ({ activeSession, sessionTime, onEndSession, onTakeBreak, usePomodoro, onTogglePomodoro }) => {
  const [isHovered, setIsHovered] = useState(false);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressColor = () => {
    const progress = (sessionTime / 3600) * 100; // Progress as percentage of 1 hour
    if (progress < 25) return 'bg-green-500';
    if (progress < 50) return 'bg-blue-500';
    if (progress < 75) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStudyMood = () => {
    const hours = sessionTime / 3600;
    if (hours < 0.25) return '🌱 Just getting started';
    if (hours < 0.5) return '🚀 Building momentum';
    if (hours < 1) return '🔥 In the zone';
    if (hours < 2) return '⚡ Power studying';
    return '🌟 Legendary focus';
  };

  return (
    <div 
      className={`bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl transform transition-all duration-500 ${
        isHovered ? 'scale-105' : 'scale-100'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Study Session Active</h2>
          <p className="text-blue-100 text-lg">Keep up the great work! 💪</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-blue-100 mb-1">Current Mood</div>
          <div className="text-lg font-semibold">{getStudyMood()}</div>
        </div>
      </div>

      {/* Subject */}
      <div className="mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-2xl">📚</span>
          </div>
          <div>
            <div className="text-sm text-blue-100">Studying</div>
            <div className="text-xl font-semibold">{activeSession?.subject || 'General Study'}</div>
          </div>
        </div>
      </div>

      {/* Timer Display */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
        <div className="text-center">
          <div className="text-6xl font-mono font-bold mb-2">
            {formatTime(sessionTime)}
          </div>
          <div className="text-blue-100">Session Duration</div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${getProgressColor()}`}
              style={{ width: `${Math.min((sessionTime / 3600) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
          <div className="text-2xl font-bold">{activeSession?.breaksTaken || 0}</div>
          <div className="text-sm text-blue-100">Breaks Taken</div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
          <div className="text-2xl font-bold">{Math.round(sessionTime / 60)}</div>
          <div className="text-sm text-blue-100">Minutes</div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
          <div className="text-2xl font-bold">{Math.round((sessionTime / 3600) * 10) / 10}</div>
          <div className="text-sm text-blue-100">Hours</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={onTakeBreak}
          className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-4 px-6 rounded-xl transform transition-all duration-200 hover:scale-105 flex items-center justify-center space-x-2"
        >
          <span>☕</span>
          <span>Take Break</span>
        </button>
        
        <button
          onClick={onEndSession}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-4 px-6 rounded-xl transform transition-all duration-200 hover:scale-105 flex items-center justify-center space-x-2"
        >
          <span>🏁</span>
          <span>End Session</span>
        </button>
      </div>

      {/* Pomodoro Toggle */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-blue-100">🍅</span>
          <span className="text-sm">Pomodoro Timer</span>
        </div>
        <button
          onClick={onTogglePomodoro}
          className={`w-14 h-8 rounded-full transition-all duration-300 ${
            usePomodoro ? 'bg-green-400' : 'bg-gray-400'
          }`}
        >
          <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-all duration-300 ${
            usePomodoro ? 'translate-x-7' : 'translate-x-1'
          }`} />
        </button>
      </div>

      {/* Motivational Quote */}
      <div className="mt-6 text-center text-blue-100 italic">
        "Success is the sum of small efforts repeated day in and day out."
      </div>
    </div>
  );
};
