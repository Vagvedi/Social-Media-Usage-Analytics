import { useState, useEffect } from 'react';

export const StudyReminders = ({ goals, onSnooze, onComplete }) => {
  const [reminders, setReminders] = useState([]);
  const [showNotifications, setShowNotifications] = useState(true);

  useEffect(() => {
    // Check for upcoming deadlines and generate reminders
    const checkDeadlines = () => {
      const now = new Date();
      const upcomingReminders = [];

      goals.forEach(goal => {
        if (goal.status === 'completed') return;

        const deadline = new Date(goal.deadline);
        const timeUntilDeadline = deadline - now;
        const daysUntilDeadline = Math.ceil(timeUntilDeadline / (1000 * 60 * 60 * 24));

        // Generate reminders based on urgency
        if (daysUntilDeadline <= 1) {
          upcomingReminders.push({
            id: goal.id,
            type: 'urgent',
            title: `🚨 Deadline Today!`,
            message: `${goal.subject} deadline is today!`,
            goal,
            timeLeft: `${hoursUntilDeadline(deadline)} hours`
          });
        } else if (daysUntilDeadline <= 3) {
          upcomingReminders.push({
            id: goal.id,
            type: 'warning',
            title: `⏰ Deadline Soon`,
            message: `${goal.subject} deadline in ${daysUntilDeadline} days`,
            goal,
            timeLeft: `${daysUntilDeadline} days`
          });
        } else if (daysUntilDeadline <= 7) {
          upcomingReminders.push({
            id: goal.id,
            type: 'info',
            title: `📅 Upcoming Deadline`,
            message: `${goal.subject} deadline in ${daysUntilDeadline} days`,
            goal,
            timeLeft: `${daysUntilDeadline} days`
          });
        }
      });

      setReminders(upcomingReminders);
    };

    const hoursUntilDeadline = (deadline) => {
      const now = new Date();
      const hours = Math.ceil((deadline - now) / (1000 * 60 * 60));
      return Math.max(0, hours);
    };

    checkDeadlines();
    const interval = setInterval(checkDeadlines, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [goals]);

  const getReminderColor = (type) => {
    switch (type) {
      case 'urgent': return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'info': return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
      default: return 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800';
    }
  };

  const getReminderIcon = (type) => {
    switch (type) {
      case 'urgent': return '🚨';
      case 'warning': return '⏰';
      case 'info': return '📅';
      default: return '📝';
    }
  };

  if (!showNotifications || reminders.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Study Reminders</h3>
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          {showNotifications ? '🔕' : '🔔'}
        </button>
      </div>

      <div className="space-y-3">
        {reminders.map((reminder) => (
          <div
            key={reminder.id}
            className={`p-4 rounded-lg border ${getReminderColor(reminder.type)} hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <span className="text-lg">{getReminderIcon(reminder.type)}</span>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {reminder.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {reminder.message}
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>⏱️ {reminder.timeLeft}</span>
                    <span>📊 {Math.round(((parseFloat(reminder.goal.currentHours) || 0) / (parseFloat(reminder.goal.targetHours) || 1)) * 100)}% complete</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onComplete && onComplete(reminder.goal)}
                  className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Mark Complete
                </button>
                <button
                  onClick={() => onSnooze && onSnooze(reminder)}
                  className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  Snooze
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {reminders.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-2">🎉</div>
          <p>No urgent reminders! You're on track with your goals.</p>
        </div>
      )}
    </div>
  );
};
