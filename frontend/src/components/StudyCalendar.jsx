import { useState, useEffect } from 'react';
import { studyAPI } from '../services/api';
import { EditModal } from './EditModal';

export const StudyCalendar = ({ compact = false }) => {
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
      days.push(
        <div 
          key={`empty-${i}`} 
          className={compact 
            ? "aspect-square rounded-lg bg-gray-50/50" 
            : "h-24 rounded-xl bg-slate-50/50"
          }
        ></div>
      );
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const events = getEventsForDate(date);
      const hasEvents = events.sessions.length > 0 || events.goals.length > 0;
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = selectedDate?.toDateString() === date.toDateString();
      const studyHours = calculateStudyHours(date);

      if (compact) {
        // Compact mode for Dashboard
        days.push(
          <div
            key={day}
            onClick={() => handleDateClick(date)}
            className={`calendar-day text-xs ${
              isToday 
                ? 'bg-blue-100 text-blue-700 font-medium' 
                : hasEvents
                  ? 'bg-gray-50 hover:bg-gray-100'
                  : 'hover:bg-gray-50'
            }`}
          >
            {day}
            {hasEvents && (
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                {events.sessions.length > 0 && (
                  <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                )}
              </div>
            )}
          </div>
        );
      } else {
        // Full mode for Study Hub
        days.push(
          <div
            key={day}
            onClick={() => handleDateClick(date)}
            className={`h-24 rounded-xl p-3 cursor-pointer transition-all duration-200 border ${
              isToday 
                ? 'bg-blue-50 border-blue-200 shadow-md' 
                : isSelected
                  ? 'bg-blue-100 border-blue-300 shadow-md'
                  : hasEvents
                    ? 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md hover:-translate-y-1'
                    : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-sm'
            }`}
          >
            <div className="flex justify-between items-start mb-1">
              <span className={`text-sm font-semibold ${
                isToday ? 'text-blue-600' : 'text-slate-700'
              }`}>
                {day}
              </span>
              {hasEvents && (
                <div className="flex gap-1">
                  {events.sessions.length > 0 && (
                    <span className="w-2 h-2 bg-emerald-400 rounded-full" title="Study sessions"></span>
                  )}
                  {events.goals.length > 0 && (
                    <span className="w-2 h-2 bg-amber-400 rounded-full" title="Goals"></span>
                  )}
                </div>
              )}
            </div>
            {studyHours > 0 && (
              <div className="text-xs font-medium text-emerald-600">
                {studyHours.toFixed(1)}h
              </div>
            )}
            {events.sessions.length > 0 && (
              <div className="text-xs text-slate-500 truncate">
                {events.sessions.length} session{events.sessions.length > 1 ? 's' : ''}
              </div>
            )}
          </div>
        );
      }
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
      <div className={`${compact ? '' : 'saas-card p-8'}`}>
        <div className="flex items-center justify-center h-32">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  // Compact version for Dashboard
  if (compact) {
    return (
      <div>
        {/* Compact Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-1.5 rounded hover:bg-gray-100 transition-colors"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h3 className="text-xs font-semibold text-gray-900">
              {monthYear}
            </h3>
            <button
              onClick={() => navigateMonth('next')}
              className="p-1.5 rounded hover:bg-gray-100 transition-colors"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Compact Calendar Grid */}
        <div className="calendar-grid gap-1">
          {weekDays.map(day => (
            <div key={day} className="calendar-day-header">
              {day.charAt(0)}
            </div>
          ))}
          {renderCalendar()}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span className="text-xs text-gray-500">Next Exam: Data Structures</span>
          </div>
        </div>
      </div>
    );
  }

  // Full version for Study Hub
  return (
    <>
      <div className="saas-card overflow-hidden">
        {/* Calendar Header */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Study Calendar</h2>
                <p className="text-slate-500 text-sm">Track your learning journey</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="px-4 py-2 bg-slate-100 rounded-lg min-w-[140px] text-center">
                <h3 className="text-sm font-semibold text-slate-900">
                  {monthYear}
                </h3>
              </div>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-6">
          {/* Week day headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center py-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{day}</span>
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2">
            {renderCalendar()}
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && selectedDate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="saas-card max-w-2xl w-full max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h3>
                  <p className="text-slate-500 text-sm">Study Day Overview</p>
                </div>
              </div>
              <button
                onClick={() => setShowEventModal(false)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Study Sessions */}
              {selectedEvents.sessions.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253z" />
                      </svg>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-900">Study Sessions ({selectedEvents.sessions.length})</h4>
                  </div>
                  <div className="space-y-3">
                    {selectedEvents.sessions.map(session => (
                      <div key={session.id} className="p-4 rounded-xl bg-slate-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-slate-900 mb-1">
                              {session.subject}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{formatTime(session.startTime)} - {formatTime(session.endTime)}</span>
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              Duration: <span className="text-emerald-600 font-medium">{((new Date(session.endTime) - new Date(session.startTime)) / (1000 * 60 * 60)).toFixed(1)} hours</span>
                            </div>
                            {session.productivity && (
                              <div className="mt-2">
                                <span className={`saas-badge ${
                                  session.productivity === 'high' ? 'success' :
                                  session.productivity === 'medium' ? 'warning' :
                                  'error'
                                }`}>
                                  {session.productivity} productivity
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => editSession(session)}
                              className="p-2 rounded-lg hover:bg-slate-200 transition-colors"
                              title="Edit session"
                            >
                              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => deleteSession(session.id)}
                              className="p-2 rounded-lg hover:bg-rose-100 transition-colors"
                              title="Delete session"
                            >
                              <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        {session.notes && (
                          <div className="mt-3 pt-3 border-t border-slate-200">
                            <p className="text-xs text-slate-500">
                              <span className="font-medium">Notes:</span> {session.notes}
                            </p>
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
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-900">Goals ({selectedEvents.goals.length})</h4>
                  </div>
                  <div className="space-y-3">
                    {selectedEvents.goals.map(goal => (
                      <div key={goal.id} className="p-4 rounded-xl bg-slate-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-slate-900 flex items-center gap-2 mb-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: goal.color }}
                              ></div>
                              {goal.subject}
                            </div>
                            <div className="flex items-center justify-between text-xs mb-2">
                              <span className="text-slate-500">
                                Target: <span className="font-medium">{goal.targetHours}h</span>
                              </span>
                              <span className="text-slate-500">
                                Current: <span className="text-emerald-600 font-medium">{goal.currentHours}h</span>
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                                <span>Progress</span>
                                <span className="font-medium">{Math.round(((parseFloat(goal.currentHours) || 0) / (parseFloat(goal.targetHours) || 1)) * 100)}%</span>
                              </div>
                              <div className="saas-progress h-2">
                                <div 
                                  className="saas-progress-bar"
                                  style={{ width: `${Math.min(((parseFloat(goal.currentHours) || 0) / (parseFloat(goal.targetHours) || 1)) * 100, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1 ml-3">
                            <button
                              onClick={() => editGoal(goal)}
                              className="p-2 rounded-lg hover:bg-slate-200 transition-colors"
                              title="Edit goal"
                            >
                              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => deleteGoal(goal.id)}
                              className="p-2 rounded-lg hover:bg-rose-100 transition-colors"
                              title="Delete goal"
                            >
                              <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253z" />
                    </svg>
                  </div>
                  <p className="text-slate-600 mb-4">No study sessions or goals on this date</p>
                  <button
                    onClick={() => setShowEventModal(false)}
                    className="btn-secondary"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
