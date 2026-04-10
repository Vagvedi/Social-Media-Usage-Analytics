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
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Premium Hero Section */}
      <div className="relative overflow-hidden rounded-3xl">
        {/* Rich gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-yellow-200 to-sky-400"></div>
        {/* Glow effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-300/30 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-300/30 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        {/* Noise texture overlay */}
        <div className="absolute inset-0 opacity-30" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E")'}}></div>
        
        <div className="relative glass-card p-10">
          <div className="flex items-center justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-ocean-500 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/30">
                  <span className="text-2xl">📚</span>
                </div>
                <span className="text-white font-black text-sm tracking-widest uppercase">Happy Study Suite</span>
              </div>
              <h1 className="text-5xl font-black text-white mb-4 leading-tight drop-shadow-lg">
                Study Hub
              </h1>
              <p className="text-xl text-white mb-2 font-medium">Master your studies with intelligent tracking and insights</p>
              <p className="text-yellow-100 font-black">Welcome back, {user?.username || 'Student'}! 🎓</p>
            </div>
            <div className="text-center">
              {activeSession ? (
                <div className="glass-card p-6 border-caramel-400/30 shadow-2xl shadow-coffee-900/50">
                  <div className="text-sm text-caramel-300 font-semibold mb-2 uppercase tracking-wider">Session Active</div>
                  <div className="text-4xl font-mono font-bold text-coffee-100 mb-4 tracking-widest">{formatTime(sessionTime)}</div>
                  <button
                    onClick={endStudySession}
                    className="btn-primary w-full text-sm py-3 px-6"
                  >
                    End Session
                  </button>
                </div>
              ) : (
                <button
                  onClick={startStudySession}
                  className="btn-primary flex items-center space-x-3 text-lg px-8 py-5 shadow-2xl shadow-caramel-500/30"
                >
                  <span className="text-2xl">�</span>
                  <span className="font-bold">Start Session</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Premium Floating Pill Tabs */}
      <div className="glass-card p-2 rounded-full">
        <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'sessions', label: 'Sessions', icon: '⏱️' },
            { id: 'goals', label: 'Goals', icon: '🎯' },
            { id: 'planner', label: 'Planner', icon: '📅' },
            { id: 'statistics', label: 'Statistics', icon: '📈' },
            { id: 'analytics', label: 'Analytics', icon: '🧠' },
            { id: 'education-analytics', label: 'Education', icon: '📊' },
            { id: 'calendar', label: 'Calendar', icon: '📅' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-full transition-all duration-500 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-pink-500 via-pink-400 to-ocean-400 text-white shadow-lg shadow-pink-500/30 scale-105'
                  : 'text-slate-600 hover:bg-white/40 hover:text-pink-600 hover:scale-105'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="font-semibold">{tab.label}</span>
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

          {/* Premium Study Stats Overview */}
          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="stat-card group">
                <div className="absolute top-4 right-4 w-14 h-14 bg-gradient-to-br from-ocean-500 to-sky-400 rounded-2xl flex items-center justify-center shadow-lg shadow-ocean-200 group-hover:scale-110 transition-transform duration-500">
                  <span className="text-2xl">📚</span>
                </div>
                <p className="text-slate-500 text-sm font-black uppercase tracking-wider mb-2">Total Study Hours</p>
                <p className="text-4xl font-black text-slate-800 mb-2">{analytics.totalHours}</p>
                <div className="flex items-center space-x-2">
                  <span className="text-emerald-500 text-xs font-black flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                    12%
                  </span>
                  <span className="text-slate-400 text-xs">from last week</span>
                </div>
              </div>

              <div className="stat-card group">
                <div className="absolute top-4 right-4 w-14 h-14 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-200 group-hover:scale-110 transition-transform duration-500">
                  <span className="text-2xl">🔥</span>
                </div>
                <p className="text-slate-500 text-sm font-black uppercase tracking-wider mb-2">Study Streak</p>
                <p className="text-4xl font-black text-slate-800 mb-2">{analytics.studyStreak} <span className="text-2xl text-slate-400">days</span></p>
                <div className="flex items-center space-x-2">
                  <span className="text-pink-500 text-xs font-black">Keep it going!</span>
                </div>
              </div>

              <div className="stat-card group">
                <div className="absolute top-4 right-4 w-14 h-14 bg-gradient-to-br from-pink-400 to-ocean-500 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-200 group-hover:scale-110 transition-transform duration-500">
                  <span className="text-2xl">🎯</span>
                </div>
                <p className="text-slate-500 text-sm font-black uppercase tracking-wider mb-2">Focus Score</p>
                <p className="text-4xl font-black text-slate-800 mb-2">{analytics.averageFocusScore}<span className="text-2xl text-slate-400">%</span></p>
                <div className="flex items-center space-x-2">
                  <span className="text-pink-500 text-xs font-black flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                    5%
                  </span>
                  <span className="text-slate-400 text-xs">improvement</span>
                </div>
              </div>

              <div className="stat-card group">
                <div className="absolute top-4 right-4 w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform duration-500">
                  <span className="text-2xl">📊</span>
                </div>
                <p className="text-slate-500 text-sm font-black uppercase tracking-wider mb-2">Active Goals</p>
                <p className="text-4xl font-black text-slate-800 mb-2">{analytics.activeGoals}</p>
                <div className="flex items-center space-x-2">
                  <span className="text-emerald-600 text-xs font-black">{analytics.completedGoals} completed</span>
                </div>
              </div>
            </div>
          )}

          {/* Study Streak Component */}
          <StudyStreak />

          {/* Premium Recommendations */}
          {recommendations.length > 0 && (
            <div className="glass-card p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-ocean-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-xl">💡</span>
                </div>
                <h2 className="text-2xl font-black text-slate-800">Personalized Recommendations</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.slice(0, 6).map((rec, index) => (
                  <div key={index} className={`recommendation-card ${
                    rec.type === 'warning' ? 'border-yellow-400/30 bg-gradient-to-br from-yellow-400/10 via-transparent to-yellow-500/5' :
                    rec.type === 'success' ? 'border-emerald-400/30 bg-gradient-to-br from-emerald-400/10 via-transparent to-emerald-500/5' :
                    'border-pink-300/30 bg-gradient-to-br from-pink-300/10 via-sky-50 to-ocean-50'
                  }`}>
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        rec.type === 'warning' ? 'bg-yellow-500/20' :
                        rec.type === 'success' ? 'bg-green-500/20' :
                        'bg-caramel-500/20'
                      }`}>
                        <span className="text-2xl">
                          {rec.type === 'warning' ? '⚠️' : rec.type === 'success' ? '✅' : '💡'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-bold text-coffee-100 mb-2">{rec.title}</h3>
                        <p className="text-sm text-coffee-300 leading-relaxed">{rec.message}</p>
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
          <div className="glass-card p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-ocean-600 to-sky-400 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">⏱️</span>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800">Study Sessions</h2>
                  <p className="text-slate-500 text-sm">Track your focused learning time</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-3 px-5 py-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 cursor-pointer hover:bg-white/15 transition-all duration-300">
                  <input
                    type="checkbox"
                    checked={usePomodoro}
                    onChange={(e) => setUsePomodoro(e.target.checked)}
                    className="w-5 h-5 rounded accent-caramel-500"
                  />
                  <span className="text-sm text-coffee-200 font-medium">Use Pomodoro Timer</span>
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
                    }}
                    onResume={() => {
                      console.log('Pomodoro timer resumed');
                    }}
                    onSessionComplete={(type) => {
                      console.log(`Pomodoro session completed: ${type}`);
                      if (type === 'focus') {
                        if (window.studyNotifications) {
                          window.studyNotifications('Focus session completed! Time for a break! 🎉', 'success');
                        }
                      } else {
                        if (window.studyNotifications) {
                          window.studyNotifications('Break completed! Ready to focus again! 🚀', 'success');
                        }
                      }
                    }}
                  />
                )}
              </div>
            ) : (
              <div className="text-center py-12 glass-card">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-ocean-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-pink-200">
                  <span className="text-4xl">☕</span>
                </div>
                <p className="text-xl text-slate-700 mb-6 font-black">No active study session</p>
                <button
                  onClick={startStudySession}
                  className="btn-primary text-lg px-8 py-4"
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

      {/* Premium Study Tips */}
      <div className="glass-card p-8">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-ocean-500 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-2xl">✨</span>
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800">Study Tips & Techniques</h2>
            <p className="text-slate-500 text-sm">Proven methods to enhance your learning</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="recommendation-card border-caramel-500/20">
            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-coffee-600 to-caramel-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-coffee-900/30">
                <span className="text-2xl">⏰</span>
              </div>
              <div>
                <h3 className="font-bold text-coffee-100 mb-2 text-lg">Pomodoro Technique</h3>
                <p className="text-coffee-300 leading-relaxed">Study for 25 minutes, then take a 5-minute break. Repeat this cycle to maintain peak focus and prevent burnout.</p>
              </div>
            </div>
          </div>

          <div className="recommendation-card border-green-500/20">
            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-900/30">
                <span className="text-2xl">🎯</span>
              </div>
              <div>
                <h3 className="font-bold text-coffee-100 mb-2 text-lg">Set SMART Goals</h3>
                <p className="text-coffee-300 leading-relaxed">Make goals Specific, Measurable, Achievable, Relevant, and Time-bound for maximum productivity.</p>
              </div>
            </div>
          </div>

          <div className="recommendation-card border-caramel-500/20">
            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-caramel-400 to-gold-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-caramel-900/30">
                <span className="text-2xl">🧠</span>
              </div>
              <div>
                <h3 className="font-bold text-coffee-100 mb-2 text-lg">Active Recall</h3>
                <p className="text-coffee-300 leading-relaxed">Test yourself regularly instead of just re-reading material. This strengthens neural pathways.</p>
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
