import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { studyAPI } from '../services/api';
import { studyUtils } from '../utils/studyUtils';
import { StudyCalendar } from '../components/StudyCalendar';
import { StudyAnalytics } from '../components/StudyAnalytics';
import { FocusTimer } from '../components/FocusTimer';
import { StudyStreak } from '../components/StudyStreak';
import { StudyReminders } from '../components/StudyReminders';
import { StudyStatistics } from '../components/StudyStatistics';
import { BreakOverlay } from '../components/BreakOverlay';
import { StudyNotifications } from '../components/StudyNotifications';
import { GoalManager } from '../components/GoalManager';
import { StudySessionCard } from '../components/StudySessionCard';
import { EducationAnalyticsDashboard } from '../components/EducationAnalyticsDashboard';
import { PersonalLearningAnalytics } from '../components/PersonalLearningAnalytics';
import { SmartStudyPlanner } from '../components/SmartStudyPlanner';

export const StudyHub = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [studyStats, setStudyStats] = useState(null);
  const [studyGoals, setStudyGoals] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionTime, setSessionTime] = useState(0);
  const [focusTime, setFocusTime] = useState(0);
  const [usePomodoro, setUsePomodoro] = useState(false);
  const [showBreakOverlay, setShowBreakOverlay] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [newGoal, setNewGoal] = useState({
    subject: '',
    targetHours: '',
    deadline: '',
    priority: 'medium',
    color: '#3B82F6'
  });
  const [analytics, setAnalytics] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  // Timer effect for active session
  useEffect(() => {
    let interval;
    if (activeSession && activeSession.startTime && !usePomodoro) {
      interval = setInterval(() => {
        const elapsed = Math.floor((new Date() - new Date(activeSession.startTime)) / 1000);
        setSessionTime(elapsed);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeSession, usePomodoro]);

  useEffect(() => {
    fetchStudyData();
  }, []);

  const fetchStudyData = async () => {
    try {
      setLoading(true);
      console.log('[StudyHub] Fetching study data...');
      
      // Test basic connection first
      try {
        const testResponse = await studyAPI.getAnalytics({ period: 'week' });
        console.log('[StudyHub] API connection test successful');
      } catch (testError) {
        console.error('[StudyHub] API connection failed:', testError);
        // Continue with empty data rather than failing completely
        setStudyGoals([]);
        setActiveSession(null);
        setAnalytics({
          totalHours: 0,
          studyStreak: 0,
          averageFocusScore: 0,
          totalSessions: 0,
          activeGoals: 0,
          completedGoals: 0,
          overdueGoals: 0
        });
        setLoading(false);
        return;
      }
      
      // Fetch data in parallel
      const [goalsRes, sessionRes, analyticsRes] = await Promise.all([
        studyAPI.getGoals().catch(err => {
          console.log('[StudyHub] Goals API failed:', err);
          return { data: { data: [] } };
        }),
        studyAPI.getActiveSession().catch(err => {
          console.log('[StudyHub] Session API failed:', err);
          return { data: { data: null } };
        }),
        studyAPI.getAnalytics({ period: 'week' }).catch(err => {
          console.log('[StudyHub] Analytics API failed:', err);
          return { data: { data: null } };
        })
      ]);

      console.log('[StudyHub] Goals response:', goalsRes.data);
      console.log('[StudyHub] Session response:', sessionRes.data);
      console.log('[StudyHub] Analytics response:', analyticsRes.data);

      setStudyGoals(goalsRes.data?.data || []);
      setActiveSession(sessionRes.data?.data);
      setAnalytics(analyticsRes.data?.data || {
        totalHours: 0,
        studyStreak: 0,
        averageFocusScore: 0,
        totalSessions: 0,
        activeGoals: 0,
        completedGoals: 0,
        overdueGoals: 0
      });

      // Generate recommendations
      if (analyticsRes.data?.data) {
        const recs = studyUtils.getStudyRecommendations(
          [], // sessions would come from getSessions
          goalsRes.data?.data || []
        );
        setRecommendations(recs);
      }

    } catch (error) {
      console.error('[StudyHub] Error fetching study data:', error);
      // Set default empty state to prevent UI crashes
      setStudyGoals([]);
      setActiveSession(null);
      setAnalytics({
        totalHours: 0,
        studyStreak: 0,
        averageFocusScore: 0,
        totalSessions: 0,
        activeGoals: 0,
        completedGoals: 0,
        overdueGoals: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const startStudySession = async () => {
    try {
      console.log('[StudyHub] Starting study session...');
      const response = await studyAPI.startSession({
        subject: 'General Study',
        notes: '',
        tags: []
      });
      console.log('[StudyHub] Session started successfully:', response.data);
      setActiveSession(response.data.data);
      
      // Show success notification
      if (window.studyNotifications) {
        window.studyNotifications('Study session started successfully! 📚', 'success');
      }
    } catch (error) {
      console.error('[StudyHub] Error starting session:', error);
      const errorMessage = error.response?.data?.message || error.message;
      
      // Show error notification
      if (window.studyNotifications) {
        window.studyNotifications(`Failed to start study session: ${errorMessage}`, 'error');
      }
      
      alert(`Failed to start study session: ${errorMessage}`);
    }
  };

  const takeBreak = async () => {
    console.log('takeBreak called, activeSession:', activeSession);
    if (!activeSession) {
      console.log('No active session found');
      return;
    }

    try {
      // Update the session to record a break
      const updateData = {
        breaksTaken: (activeSession.breaksTaken || 0) + 1,
        notes: (activeSession.notes || '') + `\nBreak taken at ${new Date().toLocaleTimeString()}`
      };
      console.log('Break update data:', updateData);
      
      const response = await studyAPI.updateSession(activeSession.id, updateData);
      console.log('Break update response:', response);
      
      // Show the sexy break overlay
      setShowBreakOverlay(true);
      
      if (window.studyNotifications) {
        window.studyNotifications('Break time! Relax and recharge ☕', 'info');
      }
      
      await fetchStudyData();
    } catch (error) {
      console.error('Error taking break:', error);
      if (window.studyNotifications) {
        window.studyNotifications('Failed to record break', 'error');
      }
    }
  };

  const handleBreakResume = () => {
    setShowBreakOverlay(false);
    if (window.studyNotifications) {
      window.studyNotifications('Break finished! Back to focus mode 🎯', 'success');
    }
  };

  const endStudySession = async () => {
    if (!activeSession) return;

    // Show productivity dialog
    const productivity = prompt('How was your focus level during this session?\n1 - Low\n2 - Medium\n3 - High\n\nEnter 1, 2, or 3:');
    
    let productivityLevel = 'medium';
    if (productivity === '1') productivityLevel = 'low';
    else if (productivity === '3') productivityLevel = 'high';
    else if (!productivity || productivity === '2') productivityLevel = 'medium';
    else {
      alert('Invalid input. Using medium productivity.');
    }

    try {
      await studyAPI.endSession(activeSession.id, {
        productivity: productivityLevel,
        notes: ''
      });
      setActiveSession(null);
      setSessionTime(0);
      fetchStudyData();
      
      if (window.studyNotifications) {
        window.studyNotifications(`Study session ended! Productivity: ${productivityLevel} 🎉`, 'success');
      }
    } catch (error) {
      console.error('Error ending session:', error);
      if (window.studyNotifications) {
        window.studyNotifications('Failed to end session', 'error');
      }
    }
  };

  const createStudyGoal = async (goalData) => {
    try {
      console.log('[StudyHub] Creating study goal:', goalData);
      const response = await studyAPI.createGoal({
        ...goalData,
        targetHours: parseFloat(goalData.targetHours)
      });
      console.log('[StudyHub] Goal created successfully:', response.data);
      fetchStudyData();
      
      if (window.studyNotifications) {
        window.studyNotifications('Goal created successfully! 🎯', 'success');
      }
    } catch (error) {
      console.error('[StudyHub] Error creating goal:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      
      // Show error notification
      if (window.studyNotifications) {
        window.studyNotifications(`Failed to create study goal: ${errorMessage}`, 'error');
      }
      
      alert(`Failed to create study goal: ${errorMessage}`);
    }
  };

  const updateGoalProgress = async (goalId, hours) => {
    console.log('updateGoalProgress called with goalId:', goalId, 'hours:', hours);
    try {
      const goal = studyGoals.find(g => g.id === goalId);
      console.log('Found goal:', goal);
      if (goal) {
        const currentHours = parseFloat(goal.currentHours) || 0;
        const targetHours = parseFloat(goal.targetHours) || 1;
        const newHours = Math.min(currentHours + hours, targetHours);
        console.log('Updating goal to new hours:', newHours);
        
        // Check if goal is being completed
        const isCompleted = newHours >= targetHours;
        
        const updateData = {
          currentHours: newHours,
          status: isCompleted ? 'completed' : 'in-progress'
        };
        console.log('Update data:', updateData);
        
        const response = await studyAPI.updateGoal(goalId, updateData);
        console.log('Update response:', response);
        
        await fetchStudyData();
        
        if (window.studyNotifications) {
          if (isCompleted) {
            window.studyNotifications('Goal completed successfully! 🎉', 'success');
          } else {
            window.studyNotifications('Goal progress updated! 🎯', 'success');
          }
        }
      } else {
        console.error('Goal not found with ID:', goalId);
        if (window.studyNotifications) {
          window.studyNotifications('Goal not found', 'error');
        }
      }
    } catch (error) {
      console.error('Error updating goal:', error);
      if (window.studyNotifications) {
        window.studyNotifications('Failed to update goal', 'error');
      }
    }
  };

  const updateStudyGoal = async (goalId, data) => {
    try {
      await studyAPI.updateGoal(goalId, data);
      fetchStudyData();
      
      if (window.studyNotifications) {
        window.studyNotifications('Goal updated successfully! 🎯', 'success');
      }
    } catch (error) {
      console.error('Error updating goal:', error);
      if (window.studyNotifications) {
        window.studyNotifications('Failed to update goal', 'error');
      }
    }
  };

  const snoozeGoal = async (goalId) => {
    console.log('snoozeGoal called with goalId:', goalId);
    try {
      const goal = studyGoals.find(g => g.id === goalId);
      console.log('Found goal for snooze:', goal);
      if (goal) {
        // Extend deadline by 7 days
        const currentDeadline = new Date(goal.deadline);
        const newDeadline = new Date(currentDeadline);
        newDeadline.setDate(newDeadline.getDate() + 7);
        console.log('Current deadline:', currentDeadline);
        console.log('New deadline:', newDeadline);
        
        const updateData = {
          deadline: newDeadline.toISOString().split('T')[0],
          status: 'snoozed'
        };
        console.log('Update data:', updateData);
        
        const response = await studyAPI.updateGoal(goalId, updateData);
        console.log('Update response:', response);
        
        await fetchStudyData();
        
        if (window.studyNotifications) {
          window.studyNotifications('Goal snoozed for 7 more days! ⏰', 'info');
        }
      } else {
        console.error('Goal not found with ID:', goalId);
        if (window.studyNotifications) {
          window.studyNotifications('Goal not found', 'error');
        }
      }
    } catch (error) {
      console.error('Error snoozing goal:', error);
      if (window.studyNotifications) {
        window.studyNotifications('Failed to snooze goal', 'error');
      }
    }
  };

  const deleteGoal = async (goalId) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;
    
    try {
      await studyAPI.deleteGoal(goalId);
      fetchStudyData();
      
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

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-lg p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Study Hub</h1>
            <p className="text-blue-100 text-lg">Master your studies with intelligent tracking and insights</p>
            <p className="text-sm text-blue-200 mt-2">Welcome back, {user?.username || 'Student'}! 🎓</p>
          </div>
          <div className="text-center">
            {activeSession ? (
              <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                <div className="text-sm text-blue-100 mb-1">Session Active</div>
                <div className="text-3xl font-mono font-bold">{formatTime(sessionTime)}</div>
                <button
                  onClick={endStudySession}
                  className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                >
                  End Session
                </button>
              </div>
            ) : (
              <button
                onClick={startStudySession}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2 shadow-lg"
              >
                <span className="text-xl">📚</span>
                <span>Start Session</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex space-x-1 p-1">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'sessions', label: 'Sessions', icon: '⏱️' },
            { id: 'goals', label: 'Goals', icon: '🎯' },
            { id: 'planner', label: 'Planner', icon: '📅' },
            { id: 'statistics', label: 'Statistics', icon: '📈' },
            { id: 'analytics', label: 'Analytics', icon: '🧠' },
            { id: 'education-analytics', label: 'Education Analytics', icon: '📊' },
            { id: 'calendar', label: 'Calendar', icon: '📅' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Study Reminders */}
          <StudyReminders 
            goals={studyGoals}
            onSnooze={(reminder) => snoozeGoal(reminder.goal.id)}
            onComplete={(goal) => {
              const currentHours = parseFloat(goal.currentHours) || 0;
              const targetHours = parseFloat(goal.targetHours) || 1;
              const remainingHours = targetHours - currentHours;
              updateGoalProgress(goal.id, remainingHours);
            }}
          />

          {/* Study Stats Overview */}
          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Study Hours</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalHours}</p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">↑ 12% from last week</p>
                  </div>
                  <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">📚</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Study Streak</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.studyStreak} days</p>
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">🔥 Keep it going!</p>
                  </div>
                  <div className="h-8 w-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">🔥</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Focus Score</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.averageFocusScore}%</p>
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">↑ 5% improvement</p>
                  </div>
                  <div className="h-8 w-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">🎯</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Active Goals</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.activeGoals}</p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">{analytics.completedGoals} completed</p>
                  </div>
                  <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">📊</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Study Streak Component */}
          <StudyStreak />

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Personalized Recommendations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations.slice(0, 6).map((rec, index) => (
                  <div key={index} className={`p-4 rounded-lg border hover:shadow-md transition-shadow ${
                    rec.type === 'warning' ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800' :
                    rec.type === 'success' ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' :
                    'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                  }`}>
                    <div className="flex items-start space-x-3">
                      <span className="text-lg">
                        {rec.type === 'warning' ? '⚠️' : rec.type === 'success' ? '✅' : '💡'}
                      </span>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{rec.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{rec.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'sessions' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Study Sessions</h2>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={usePomodoro}
                    onChange={(e) => setUsePomodoro(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Use Pomodoro Timer</span>
                </label>
              </div>
            </div>
            
            {activeSession ? (
              <div className="space-y-6">
                <StudySessionCard
                  activeSession={activeSession}
                  sessionTime={sessionTime}
                  onEndSession={endStudySession}
                  onTakeBreak={takeBreak}
                  usePomodoro={usePomodoro}
                  onTogglePomodoro={() => setUsePomodoro(!usePomodoro)}
                />
                
                {usePomodoro && (
                  <FocusTimer
                    isActive={!!activeSession}
                    onTimeUpdate={setFocusTime}
                    onPause={() => {
                      console.log('Pomodoro timer paused');
                      // Optionally pause the session too
                    }}
                    onResume={() => {
                      console.log('Pomodoro timer resumed');
                      // Optionally resume the session too
                    }}
                    onSessionComplete={(type) => {
                      console.log(`Pomodoro session completed: ${type}`);
                      if (type === 'focus') {
                        // Focus session completed - show notification
                        if (window.studyNotifications) {
                          window.studyNotifications('Focus session completed! Time for a break! 🎉', 'success');
                        }
                      } else {
                        // Break completed - ready for next focus session
                        if (window.studyNotifications) {
                          window.studyNotifications('Break completed! Ready to focus again! 🚀', 'success');
                        }
                      }
                    }}
                  />
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 mb-4">No active study session</p>
                <button
                  onClick={startStudySession}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Start a Study Session
                </button>
              </div>
            )}
          </div>
          
          <StudyStreak />
        </div>
      )}

      {activeTab === 'goals' && (
        <GoalManager
          goals={studyGoals}
          onCreate={createStudyGoal}
          onUpdate={updateStudyGoal}
          onDelete={deleteGoal}
          onProgressUpdate={updateGoalProgress}
          onSnooze={snoozeGoal}
        />
      )}

      {activeTab === 'analytics' && <StudyAnalytics />}
      {activeTab === 'statistics' && <StudyStatistics />}
      {activeTab === 'calendar' && <StudyCalendar />}

      {activeTab === 'education-analytics' && (
        <PersonalLearningAnalytics />
      )}

      {activeTab === 'planner' && (
        <SmartStudyPlanner />
      )}

      {/* Debug Panel - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 border border-gray-300 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Debug Info</h3>
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <div>Loading: {loading ? 'Yes' : 'No'}</div>
            <div>Active Session: {activeSession ? `ID: ${activeSession.id}` : 'None'}</div>
            <div>Goals Count: {studyGoals.length}</div>
            <div>Analytics: {analytics ? 'Loaded' : 'Not loaded'}</div>
            <div>Current Tab: {activeTab}</div>
            <div>User ID: {user?.id || 'Not loaded'}</div>
          </div>
        </div>
      )}

      {/* Study Tips - Always visible at bottom */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Study Tips & Techniques</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow">
            <div className="flex items-start space-x-3">
              <div className="h-6 w-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs">💡</span>
              </div>
              <div>
                <h3 className="font-medium text-blue-900 dark:text-blue-100">Pomodoro Technique</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">Study for 25 minutes, then take a 5-minute break. Repeat!</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 hover:shadow-md transition-shadow">
            <div className="flex items-start space-x-3">
              <div className="h-6 w-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs">🎯</span>
              </div>
              <div>
                <h3 className="font-medium text-green-900 dark:text-green-100">Set SMART Goals</h3>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">Make goals Specific, Measurable, Achievable, Relevant, and Time-bound.</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 hover:shadow-md transition-shadow">
            <div className="flex items-start space-x-3">
              <div className="h-6 w-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs">🧠</span>
              </div>
              <div>
                <h3 className="font-medium text-purple-900 dark:text-purple-100">Active Recall</h3>
                <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">Test yourself regularly instead of just re-reading material.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <StudyNotifications />
      
      {/* Break Overlay */}
      <BreakOverlay 
        isVisible={showBreakOverlay}
        onResume={handleBreakResume}
        breakDuration={5}
      />
    </div>
  );
};
