import { useState } from 'react';

// Helper functions
const calculateDaysLeft = (deadline) => {
  if (!deadline) return 0;
  const today = new Date();
  const deadlineDate = new Date(deadline);
  const diffTime = deadlineDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high': return 'bg-red-500 text-white border-red-600';
    case 'medium': return 'bg-yellow-500 text-white border-yellow-600';
    case 'low': return 'bg-green-500 text-white border-green-600';
    default: return 'bg-gray-500 text-white border-gray-600';
  }
};

const getStatusBadgeColor = (status) => {
  switch (status) {
    case 'completed': return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white';
    case 'snoozed': return 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white';
    case 'in-progress': return 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white';
    default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
  }
};

export const GoalManager = ({ goals, onCreate, onUpdate, onDelete, onProgressUpdate, onSnooze }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    subject: '',
    targetHours: '',
    deadline: '',
    priority: 'medium',
    color: '#3B82F6',
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingGoal) {
      onUpdate(editingGoal.id, formData);
    } else {
      onCreate(formData);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      subject: '',
      targetHours: '',
      deadline: '',
      priority: 'medium',
      color: '#3B82F6',
      description: ''
    });
    setEditingGoal(null);
    setShowForm(false);
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      subject: goal.subject,
      targetHours: goal.targetHours,
      deadline: goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '',
      priority: goal.priority,
      color: goal.color,
      description: goal.description || ''
    });
    setShowForm(true);
  };

  const priorityColors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-800 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              🎯 Study Goals
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track your learning journey and achieve your dreams
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Goal</span>
          </button>
        </div>
      </div>

      {/* Goal Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              {editingGoal ? '✏️ Edit Goal' : '🚀 Create New Goal'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    📚 Subject
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                    placeholder="e.g., Mathematics, Physics"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    ⏱️ Target Hours
                  </label>
                  <input
                    type="number"
                    value={formData.targetHours}
                    onChange={(e) => setFormData({ ...formData, targetHours: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                    placeholder="e.g., 50"
                    min="1"
                    step="0.5"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    📅 Deadline
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    🎯 Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                  >
                    <option value="high">🔥 High Priority</option>
                    <option value="medium">⚡ Medium Priority</option>
                    <option value="low">💚 Low Priority</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  🎨 Color Theme
                </label>
                <div className="flex space-x-3">
                  {priorityColors.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-10 h-10 rounded-full border-4 transition-all duration-200 transform hover:scale-110 ${
                        formData.color === color ? 'border-gray-900 dark:border-white scale-110' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  📝 Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                  placeholder="Add notes about this goal..."
                />
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  {editingGoal ? '💾 Update Goal' : '🚀 Create Goal'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  ❌ Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Goals List */}
      <div className="space-y-6">
        {goals.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">🎯</div>
            <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">
              No study goals yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              Create your first goal to start tracking your progress!
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              🚀 Create Your First Goal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {goals.map((goal, index) => {
              const currentHours = parseFloat(goal.currentHours) || 0;
              const targetHours = parseFloat(goal.targetHours) || 1;
              const progress = (currentHours / targetHours) * 100;
              const daysLeft = calculateDaysLeft(goal.deadline);
              const isOverdue = daysLeft < 0;
              
              return (
                <div
                  key={goal.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden border-2 border-gray-200 dark:border-gray-700"
                >
                  {/* Header */}
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full shadow-md"
                          style={{ backgroundColor: goal.color }}
                        />
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {goal.subject}
                          </h3>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getPriorityColor(goal.priority)}`}>
                              {goal.priority.toUpperCase()}
                            </span>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(goal.status)}`}>
                              {goal.status.replace('-', ' ').toUpperCase()}
                            </span>
                            {isOverdue && (
                              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-500 text-white animate-pulse">
                                OVERDUE
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(goal)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transform hover:scale-110 transition-all duration-200"
                          title="Edit goal"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => onSnooze(goal.id)}
                          className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300 transform hover:scale-110 transition-all duration-200"
                          title="Snooze goal (extend deadline by 7 days)"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => onDelete(goal.id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transform hover:scale-110 transition-all duration-200"
                          title="Delete goal"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-semibold">Progress: {currentHours.toFixed(1)} / {targetHours} hours</span>
                        <span className="font-bold text-lg">{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000 ease-out"
                          style={{
                            width: `${Math.min(progress, 100)}%`,
                            backgroundColor: goal.color
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>📅 {new Date(goal.deadline).toLocaleDateString()}</span>
                      <span className={`font-semibold ${isOverdue ? 'text-red-600 dark:text-red-400' : ''}`}>
                        {isOverdue ? `⚠️ ${Math.abs(daysLeft)} days overdue` : `⏰ ${daysLeft} days left`}
                      </span>
                    </div>

                    {/* Status Indicators */}
                    {goal.status === 'completed' && (
                      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-green-200 dark:border-green-800">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-bold text-green-800 dark:text-green-300">Goal Completed! 🎉</h4>
                            <p className="text-green-700 dark:text-green-400 text-sm">Amazing work! You achieved your target!</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {goal.status === 'snoozed' && (
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3l3 3v-4m-6 0v4l3 3m6-3l3 3v-4m-6 0v4l3 3" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-bold text-blue-800 dark:text-blue-300">Goal Snoozed ⏰</h4>
                            <p className="text-blue-700 dark:text-blue-400 text-sm">Deadline extended for 7 more days</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Quick Progress Actions */}
                    {goal.status !== 'completed' && (
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => onProgressUpdate(goal.id, 0.5)}
                          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                        >
                          +30 min
                        </button>
                        <button
                          onClick={() => onProgressUpdate(goal.id, 1)}
                          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                        >
                          +1 hour
                        </button>
                        <button
                          onClick={() => onProgressUpdate(goal.id, 2)}
                          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                        >
                          +2 hours
                        </button>
                        <button
                          onClick={() => {
                            const remainingHours = targetHours - currentHours;
                            onProgressUpdate(goal.id, remainingHours);
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                        >
                          ✅ Complete
                        </button>
                      </div>
                    )}

                    {/* Description */}
                    {goal.description && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                        <p className="text-sm text-gray-600 dark:text-gray-400">{goal.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
