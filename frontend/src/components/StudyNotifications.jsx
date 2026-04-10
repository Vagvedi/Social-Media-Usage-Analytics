import { useState, useEffect } from 'react';

export const StudyNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    const notification = {
      id,
      message,
      type,
      timestamp: new Date()
    };

    setNotifications(prev => [...prev, notification]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-500 text-white border-green-600';
      case 'error':
        return 'bg-red-500 text-white border-red-600';
      case 'warning':
        return 'bg-yellow-500 text-white border-yellow-600';
      default:
        return 'bg-blue-500 text-white border-blue-600';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  // Expose the addNotification function globally
  useEffect(() => {
    window.studyNotifications = addNotification;
    return () => {
      delete window.studyNotifications;
    };
  }, []);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`flex items-center space-x-3 p-4 rounded-lg shadow-lg border ${getNotificationStyles(notification.type)} min-w-[300px] max-w-md animate-pulse`}
        >
          <span className="text-lg">{getNotificationIcon(notification.type)}</span>
          <div className="flex-1">
            <p className="font-medium">{notification.message}</p>
            <p className="text-xs opacity-75">
              {notification.timestamp.toLocaleTimeString()}
            </p>
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded p-1"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};
