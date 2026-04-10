import { useState, useEffect } from 'react';
import { studyAPI } from '../services/api';
import { EditModal } from './EditModal';

export const StudyCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [editingSession, setEditingSession] = useState(null);
  const [editingGoal, setEditingGoal] = useState(null);

  useEffect(() => {
    fetchCalendarData();
  }, [currentDate]);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      const [sessionsRes, goalsRes] = await Promise.all([
        studyAPI.getSessions({ 
          startDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
          endDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
        }),
        studyAPI.getGoals()
      ]);

      setSessions(sessionsRes.data.data || []);
      setGoals(goalsRes.data.data || []);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (sessionId) => {
    try {
      await studyAPI.deleteSession(sessionId);
      await fetchCalendarData();
      setShowEventModal(false);
      setSelectedEvents([]);
      if (window.studyNotifications) {
        window.studyNotifications('Session deleted successfully', 'success');
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      if (window.studyNotifications) {
        window.studyNotifications('Failed to delete session', 'error');
      }
    }
  };

  const deleteGoal = async (goalId) => {
    try {
      await studyAPI.deleteGoal(goalId);
      await fetchCalendarData();
      setShowEventModal(false);
      setSelectedEvents([]);
      if (window.studyNotifications) {
        window.studyNotifications('Goal deleted successfully', 'success');
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
      if (window.studyNotifications) {
        window.studyNotifications('Failed to delete goal', 'error');
      }
    }
  };

  const editSession = (session) => {
    setEditingSession(session);
  };

  const editGoal = (goal) => {
    setEditingGoal(goal);
  };

  const handleSaveSession = async (updatedData) => {
    try {
      await studyAPI.updateSession(editingSession.id, updatedData);
      await fetchCalendarData();
      if (window.studyNotifications) {
        window.studyNotifications('Session updated successfully', 'success');
      }
    } catch (error) {
      console.error('Error updating session:', error);
      if (window.studyNotifications) {
        window.studyNotifications('Failed to update session', 'error');
      }
    }
  };

  const handleSaveGoal = async (updatedData) => {
    try {
      await studyAPI.updateGoal(editingGoal.id, updatedData);
      await fetchCalendarData();
      if (window.studyNotifications) {
        window.studyNotifications('Goal updated successfully', 'success');
      }
    } catch (error) {
      console.error('Error updating goal:', error);
      if (window.studyNotifications) {
        window.studyNotifications('Failed to update goal', 'error');
      }
    }
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const daySessions = sessions.filter(session => 
      new Date(session.startTime).toISOString().split('T')[0] === dateStr
    );
    const dayGoals = goals.filter(goal => 
      new Date(goal.deadline).toISOString().split('T')[0] === dateStr
    );
    return { sessions: daySessions, goals: dayGoals };
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    const events = getEventsForDate(date);
    setSelectedEvents(events);
    setShowEventModal(true);
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateStudyHours = (date) => {
    const events = getEventsForDate(date);
    return events.sessions.reduce((total, session) => {
      const duration = new Date(session.endTime) - new Date(session.startTime);
      return total + (duration / (1000 * 60 * 60));
    }, 0);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-100 dark:border-gray-700"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const events = getEventsForDate(date);
      const hasEvents = events.sessions.length > 0 || events.goals.length > 0;
      const isToday = date.toDateString() === new Date().toDateString();
      const studyHours = calculateStudyHours(date);

      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(date)}
          className={`h-24 border border-gray-200 dark:border-gray-700 p-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors ${
            isToday ? 'bg-blue-100 dark:bg-blue-900/30' : ''
          }`}
        >
          <div className="flex justify-between items-start mb-1">
            <span className={`text-sm font-medium ${
              isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
            }`}>
              {day}
            </span>
            {hasEvents && (
              <div className="flex space-x-1">
                {events.sessions.length > 0 && (
                  <span className="w-2 h-2 bg-green-500 rounded-full" title="Study sessions"></span>
                )}
                {events.goals.length > 0 && (
                  <span className="w-2 h-2 bg-orange-500 rounded-full" title="Goals"></span>
                )}
              </div>
            )}
          </div>
          {studyHours > 0 && (
            <div className="text-xs text-green-600 dark:text-green-400 font-medium">
              {studyHours.toFixed(1)}h
            </div>
          )}
          {events.sessions.length > 0 && (
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {events.sessions.length} session{events.sessions.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const monthYear = currentDate.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Study Calendar</h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white min-w-[150px] text-center">
              {monthYear}
            </h3>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-px mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-px">
          {renderCalendar()}
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              <button
                onClick={() => setShowEventModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Study Sessions */}
              {selectedEvents.sessions.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                    Study Sessions ({selectedEvents.sessions.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedEvents.sessions.map(session => (
                      <div key={session.id} className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {session.subject}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {formatTime(session.startTime)} - {formatTime(session.endTime)}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-500">
                              Duration: {((new Date(session.endTime) - new Date(session.startTime)) / (1000 * 60 * 60)).toFixed(1)} hours
                            </div>
                            {session.productivity && (
                              <div className="text-sm">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  session.productivity === 'high' ? 'bg-green-100 text-green-800' :
                                  session.productivity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {session.productivity} productivity
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => editSession(session)}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              title="Edit session"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => deleteSession(session.id)}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                              title="Delete session"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        {session.notes && (
                          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Notes: {session.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Goals */}
              {selectedEvents.goals.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
                    Goals ({selectedEvents.goals.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedEvents.goals.map(goal => (
                      <div key={goal.id} className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white flex items-center">
                              <div 
                                className="w-3 h-3 rounded-full mr-2" 
                                style={{ backgroundColor: goal.color }}
                              ></div>
                              {goal.subject}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Target: {goal.targetHours} hours | Current: {goal.currentHours} hours
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-500">
                              Progress: {Math.round(((parseFloat(goal.currentHours) || 0) / (parseFloat(goal.targetHours) || 1)) * 100)}%
                            </div>
                            <div className="mt-2">
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div 
                                  className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${Math.min(((parseFloat(goal.currentHours) || 0) / (parseFloat(goal.targetHours) || 1)) * 100, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => editGoal(goal)}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              title="Edit goal"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => deleteGoal(goal.id)}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                              title="Delete goal"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedEvents.sessions.length === 0 && selectedEvents.goals.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <div className="text-4xl mb-2">📅</div>
                  <p>No study sessions or goals on this date</p>
                  <button
                    onClick={() => setShowEventModal(false)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Edit Modals */}
    <div>
      <EditModal
        isVisible={!!editingSession}
        onClose={() => setEditingSession(null)}
        onSave={handleSaveSession}
        type="session"
        data={editingSession}
      />

      <EditModal
        isVisible={!!editingGoal}
        onClose={() => setEditingGoal(null)}
        onSave={handleSaveGoal}
        type="goal"
        data={editingGoal}
      />
    </div>
    </>
  );
};
