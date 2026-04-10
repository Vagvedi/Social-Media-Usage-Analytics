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

      setSessions(Array.isArray(sessionsRes.data.data) ? sessionsRes.data.data : []);
      setGoals(Array.isArray(goalsRes.data.data) ? goalsRes.data.data : []);
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
    const safeSessions = Array.isArray(sessions) ? sessions : [];
    const safeGoals = Array.isArray(goals) ? goals : [];
    const daySessions = safeSessions.filter(session => 
      new Date(session.startTime).toISOString().split('T')[0] === dateStr
    );
    const dayGoals = safeGoals.filter(goal => 
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
      days.push(<div key={`empty-${i}`} className="h-28 rounded-2xl bg-white/5 border border-white/5"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const events = getEventsForDate(date);
      const hasEvents = events.sessions.length > 0 || events.goals.length > 0;
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = selectedDate?.toDateString() === date.toDateString();
      const studyHours = calculateStudyHours(date);

      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(date)}
          className={`h-28 rounded-2xl p-3 cursor-pointer transition-all duration-300 border ${
            isToday 
              ? 'bg-gradient-to-br from-caramel-500/30 via-coffee-600/20 to-coffee-700/30 border-caramel-400/50 shadow-lg shadow-caramel-500/20' 
              : isSelected
                ? 'bg-gradient-to-br from-coffee-600/40 via-coffee-700/30 to-coffee-800/40 border-caramel-400/60 shadow-xl'
                : hasEvents
                  ? 'bg-white/10 border-white/20 hover:bg-white/20 hover:border-caramel-400/30 hover:shadow-lg hover:scale-105'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-105'
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <span className={`text-lg font-bold ${
              isToday ? 'text-caramel-300' : 'text-coffee-200'
            }`}>
              {day}
            </span>
            {hasEvents && (
              <div className="flex space-x-1.5">
                {events.sessions.length > 0 && (
                  <span className="w-3 h-3 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-lg shadow-green-500/50" title="Study sessions"></span>
                )}
                {events.goals.length > 0 && (
                  <span className="w-3 h-3 bg-gradient-to-br from-caramel-400 to-coffee-500 rounded-full shadow-lg shadow-caramel-500/50" title="Goals"></span>
                )}
              </div>
            )}
          </div>
          {studyHours > 0 && (
            <div className="text-sm font-bold text-green-400 mb-1">
              {studyHours.toFixed(1)}h
            </div>
          )}
          {events.sessions.length > 0 && (
            <div className="text-xs text-coffee-300 font-medium truncate">
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
      <div className="glass-card p-8">
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="glass-card overflow-hidden">
        {/* Premium Header */}
        <div className="p-8 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-caramel-400 to-coffee-600 rounded-2xl flex items-center justify-center shadow-lg shadow-caramel-500/30">
                <span className="text-2xl">📅</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-coffee-100">Study Calendar</h2>
                <p className="text-coffee-400 text-sm">Track your learning journey</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl transition-all duration-300 hover:scale-110 group"
              >
                <svg className="w-6 h-6 text-coffee-200 group-hover:text-caramel-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="glass-card px-8 py-4 rounded-2xl min-w-[200px] text-center">
                <h3 className="text-xl font-bold text-coffee-100">
                  {monthYear}
                </h3>
              </div>
              <button
                onClick={() => navigateMonth('next')}
                className="p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl transition-all duration-300 hover:scale-110 group"
              >
                <svg className="w-6 h-6 text-coffee-200 group-hover:text-caramel-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Premium Calendar Grid */}
        <div className="p-6">
          {/* Week day headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map(day => (
              <div key={day} className="text-center py-3">
                <span className="text-sm font-bold text-caramel-300 uppercase tracking-wider">{day}</span>
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2">
            {renderCalendar()}
          </div>
        </div>

      {/* Premium Event Modal */}
      {showEventModal && selectedDate && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-white/30 shadow-2xl">
            <div className="flex items-center justify-between mb-6 p-6 border-b border-white/10">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-caramel-400 to-coffee-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">📅</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-coffee-100">
                    {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h3>
                  <p className="text-coffee-400 text-sm">Study Day Overview</p>
                </div>
              </div>
              <button
                onClick={() => setShowEventModal(false)}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all duration-300 hover:scale-110 group border border-white/20"
              >
                <svg className="w-6 h-6 text-coffee-300 group-hover:text-caramel-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6 p-6 pt-0">
              {/* Premium Study Sessions */}
              {selectedEvents.sessions.length > 0 && (
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-xl">📚</span>
                    </div>
                    <h4 className="text-lg font-bold text-coffee-100">Study Sessions ({selectedEvents.sessions.length})</h4>
                  </div>
                  <div className="space-y-3">
                    {selectedEvents.sessions.map(session => (
                      <div key={session.id} className="recommendation-card border-green-500/20">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-bold text-lg text-coffee-100 mb-2">
                              {session.subject}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-coffee-300">
                              <span className="flex items-center space-x-2">
                                <svg className="w-4 h-4 text-caramel-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{formatTime(session.startTime)} - {formatTime(session.endTime)}</span>
                              </span>
                            </div>
                            <div className="text-sm text-coffee-400 mt-2">
                              Duration: <span className="text-green-400 font-semibold">{((new Date(session.endTime) - new Date(session.startTime)) / (1000 * 60 * 60)).toFixed(1)} hours</span>
                            </div>
                            {session.productivity && (
                              <div className="mt-3">
                                <span className={`risk-badge ${
                                  session.productivity === 'high' ? 'risk-low' :
                                  session.productivity === 'medium' ? 'risk-moderate' :
                                  'risk-high'
                                }`}>
                                  {session.productivity} productivity
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => editSession(session)}
                              className="p-3 bg-coffee-600/30 hover:bg-coffee-600/50 rounded-xl transition-all duration-300 hover:scale-110 group border border-coffee-500/30"
                              title="Edit session"
                            >
                              <svg className="w-5 h-5 text-coffee-200 group-hover:text-caramel-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => deleteSession(session.id)}
                              className="p-3 bg-red-500/20 hover:bg-red-500/40 rounded-xl transition-all duration-300 hover:scale-110 group border border-red-500/30"
                              title="Delete session"
                            >
                              <svg className="w-5 h-5 text-red-300 group-hover:text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        {session.notes && (
                          <div className="mt-4 pt-4 border-t border-white/10">
                            <p className="text-sm text-coffee-300">
                              <span className="text-caramel-300 font-semibold">Notes:</span> {session.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Premium Goals */}
              {selectedEvents.goals.length > 0 && (
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-caramel-400 to-coffee-600 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-xl">🎯</span>
                    </div>
                    <h4 className="text-lg font-bold text-coffee-100">Goals ({selectedEvents.goals.length})</h4>
                  </div>
                  <div className="space-y-3">
                    {selectedEvents.goals.map(goal => (
                      <div key={goal.id} className="recommendation-card border-caramel-500/20">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-bold text-lg text-coffee-100 flex items-center mb-3">
                              <div 
                                className="w-4 h-4 rounded-full mr-3 shadow-lg" 
                                style={{ backgroundColor: goal.color }}
                              ></div>
                              {goal.subject}
                            </div>
                            <div className="flex items-center justify-between text-sm mb-3">
                              <span className="text-coffee-300">
                                Target: <span className="text-caramel-300 font-semibold">{goal.targetHours}h</span>
                              </span>
                              <span className="text-coffee-300">
                                Current: <span className="text-green-400 font-semibold">{goal.currentHours}h</span>
                              </span>
                            </div>
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-xs text-coffee-400 mb-2">
                                <span>Progress</span>
                                <span className="text-caramel-300 font-semibold">{Math.round(((parseFloat(goal.currentHours) || 0) / (parseFloat(goal.targetHours) || 1)) * 100)}%</span>
                              </div>
                              <div className="progress-bar">
                                <div 
                                  className="progress-fill rounded-full"
                                  style={{ width: `${Math.min(((parseFloat(goal.currentHours) || 0) / (parseFloat(goal.targetHours) || 1)) * 100, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => editGoal(goal)}
                              className="p-3 bg-coffee-600/30 hover:bg-coffee-600/50 rounded-xl transition-all duration-300 hover:scale-110 group border border-coffee-500/30"
                              title="Edit goal"
                            >
                              <svg className="w-5 h-5 text-coffee-200 group-hover:text-caramel-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => deleteGoal(goal.id)}
                              className="p-3 bg-red-500/20 hover:bg-red-500/40 rounded-xl transition-all duration-300 hover:scale-110 group border border-red-500/30"
                              title="Delete goal"
                            >
                              <svg className="w-5 h-5 text-red-300 group-hover:text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <div className="text-center py-12 glass-card">
                  <div className="w-20 h-20 bg-gradient-to-br from-coffee-700 to-caramel-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                    <span className="text-4xl">☕</span>
                  </div>
                  <p className="text-xl text-coffee-200 mb-6 font-medium">No study sessions or goals on this date</p>
                  <button
                    onClick={() => setShowEventModal(false)}
                    className="btn-primary"
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
