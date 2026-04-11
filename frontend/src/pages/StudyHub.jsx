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
  const [studyGoals, setStudyGoals] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionTime, setSessionTime] = useState(0);
  const [usePomodoro, setUsePomodoro] = useState(false);
  const [showBreakOverlay, setShowBreakOverlay] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'analytics', label: 'Analytics' },
    { id: 'goals', label: 'Goals' },
    { id: 'calendar', label: 'Calendar' },
    { id: 'study-tracking', label: 'Study Tracking' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-8 py-8 animate-fade-in">
      {/* Alexandria-Style Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-editorial text-3xl font-semibold text-gray-900">Study Hub</h1>
          <p className="text-gray-500 text-sm mt-2">Master your studies with intelligent tracking</p>
        </div>
        
        {/* Session Timer / Start Button */}
        <div className="flex-shrink-0">
          {activeSession ? (
            <div className="clean-card p-4 inline-flex items-center gap-4">
              <div className="text-center">
                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Session Active</div>
                <div className="text-2xl font-mono font-semibold text-gray-900">{formatTime(sessionTime)}</div>
              </div>
              <button
                onClick={endStudySession}
                className="btn-primary"
              >
                End Session
              </button>
            </div>
          ) : (
            <button
              onClick={startStudySession}
              className="btn-primary flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Start Session
            </button>
          )}
        </div>
      </div>

      {/* Alexandria-Style Pill Tabs */}
      <div className="pill-tabs mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pill-tab ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
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

          {/* Study Stats Grid */}
          {analytics && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Study Hours', value: analytics.totalHours, suffix: 'h', icon: '📚' },
                { label: 'Study Streak', value: analytics.studyStreak, suffix: ' days', icon: '🔥' },
                { label: 'Focus Score', value: analytics.averageFocusScore, suffix: '%', icon: '🎯' },
                { label: 'Active Goals', value: analytics.activeGoals, suffix: '', icon: '📊' }
              ].map((stat, idx) => (
                <div key={idx} className="metric-card">
                  <div>
                    <div className="metric-label">{stat.label}</div>
                    <div className="metric-value">{stat.value}{stat.suffix}</div>
                  </div>
                  <div className="text-2xl">{stat.icon}</div>
                </div>
              ))}
            </div>
          )}

          <StudyStreak />

          <StudyAnalytics />

          <PersonalLearningAnalytics />

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="clean-card">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <h2 className="text-editorial text-lg font-semibold text-gray-900">Personalized Recommendations</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendations.slice(0, 6).map((rec, index) => (
                    <div key={index} className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          rec.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                          rec.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          <span className="text-lg">
                            {rec.type === 'warning' ? '⚠️' : rec.type === 'success' ? '✅' : '💡'}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">{rec.title}</h3>
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">{rec.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'goals' && (
        <div className="space-y-8">
          {/* Goal Manager - Main Goals Component */}
          <GoalManager
            goals={studyGoals}
            onCreate={createStudyGoal}
            onUpdate={updateStudyGoal}
            onDelete={deleteGoal}
            onProgressUpdate={updateGoalProgress}
            onSnooze={snoozeGoal}
          />

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

          {/* Goal Statistics */}
          {analytics && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Completed Goals', value: analytics.completedGoals, suffix: '', icon: '✅' },
                { label: 'Overdue Goals', value: analytics.overdueGoals, suffix: '', icon: '⚠️' },
                { label: 'Active Goals', value: analytics.activeGoals, suffix: '', icon: '🎯' },
                { label: 'Total Progress', value: studyGoals.length > 0 
                  ? ((studyGoals.reduce((acc, g) => acc + (g.currentHours / (g.targetHours || 1)), 0) / studyGoals.length) * 100).toFixed(0)
                  : 0, suffix: '%', icon: '📊' }
              ].map((stat, idx) => (
                <div key={idx} className="metric-card">
                  <div>
                    <div className="metric-label">{stat.label}</div>
                    <div className="metric-value">{typeof stat.value === 'number' ? stat.value.toFixed ? stat.value.toFixed(1).replace('.0', '') : stat.value : stat.value}{stat.suffix}</div>
                  </div>
                  <div className="text-2xl">{stat.icon}</div>
                </div>
              ))}
            </div>
          )}

          {/* Study Tips for Goal Achievement */}
          <div className="clean-card">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <h2 className="text-editorial text-lg font-semibold text-gray-900">Tips for Goal Achievement</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { icon: '🎯', title: 'Set SMART Goals', desc: 'Make goals Specific, Measurable, Achievable, Relevant, and Time-bound for maximum productivity.' },
                  { icon: '📊', title: 'Track Progress Daily', desc: 'Regular check-ins help maintain momentum and identify obstacles early.' },
                  { icon: '🏆', title: 'Celebrate Milestones', desc: 'Reward yourself for completing partial goals to stay motivated.' }
                ].map((tip, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-lg flex-shrink-0">
                        {tip.icon}
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{tip.title}</h3>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{tip.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="space-y-8">
          <StudyCalendar />
          <SmartStudyPlanner />
        </div>
      )}

      {activeTab === 'study-tracking' && (
        <div className="space-y-8">
          {/* Study Sessions */}
          <div className="clean-card">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h2 className="text-editorial text-lg font-semibold text-gray-900">Study Sessions</h2>
                </div>
                <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                  <input
                    type="checkbox"
                    checked={usePomodoro}
                    onChange={(e) => setUsePomodoro(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">Use Pomodoro Timer</span>
                </label>
              </div>
            </div>
            
            <div className="p-6">
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
                      onPause={() => console.log('Pomodoro timer paused')}
                      onResume={() => console.log('Pomodoro timer resumed')}
                      onSessionComplete={(type) => {
                        if (window.studyNotifications) {
                          window.studyNotifications(
                            type === 'focus' 
                              ? 'Focus session completed! Time for a break!' 
                              : 'Break completed! Ready to focus again!', 
                            'success'
                          );
                        }
                      }}
                    />
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 mb-4">No active study session</p>
                  <button
                    onClick={startStudySession}
                    className="btn-primary"
                  >
                    Start a Study Session
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <StudyStreak />
          <EducationAnalyticsDashboard />
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-8">
          <div className="clean-card p-6">
            <h2 className="text-editorial text-lg font-semibold text-gray-900 mb-6">Study Settings</h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Pomodoro Timer</h3>
                  <p className="text-xs text-gray-500 mt-1">Use 25/5 minute focus/break cycles</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={usePomodoro}
                    onChange={(e) => setUsePomodoro(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Break Reminders</h3>
                  <p className="text-xs text-gray-500 mt-1">Get notified when it's time for a break</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Daily Goal Alerts</h3>
                  <p className="text-xs text-gray-500 mt-1">Reminders for daily study targets</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Weekly Reports</h3>
                  <p className="text-xs text-gray-500 mt-1">Receive weekly progress summaries</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="clean-card p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Account</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user?.username || 'User'}</p>
                  <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
