import { useState, useEffect } from 'react';
import { usageAPI } from '../services/api';
import { format } from 'date-fns';
import { formatMinutesToHours } from '../utils/timeFormatter';

const APP_OPTIONS = [
  'Instagram',
  'Facebook',
  'Twitter (X)',
  'TikTok',
  'YouTube',
  'Snapchat',
  'WhatsApp',
  'Other'
];

export const UsageHistory = ({ onUpdate }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ appName: '', customAppName: '', minutesSpent: '', date: '' });

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await usageAPI.getAll({ limit: 50 });
      setLogs(response.data.data.logs);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load usage history');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (log) => {
    setEditingId(log.id);
    // Check if the app name is in the predefined list
    const isPredefined = APP_OPTIONS.includes(log.appName);
    setEditForm({
      appName: isPredefined ? log.appName : 'Other',
      customAppName: isPredefined ? '' : log.appName,
      minutesSpent: log.minutesSpent.toString(),
      date: format(new Date(log.date), 'yyyy-MM-dd')
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ appName: '', minutesSpent: '', date: '' });
  };

  const handleUpdate = async (id) => {
    try {
      setError('');
      // Use customAppName if "Other" is selected, otherwise use appName
      const finalAppName = editForm.appName === 'Other' 
        ? editForm.customAppName.trim() 
        : editForm.appName.trim();

      if (!finalAppName) {
        setError('Please enter an app name');
        return;
      }

      await usageAPI.update(id, {
        appName: finalAppName,
        minutesSpent: parseFloat(editForm.minutesSpent),
        date: editForm.date
      });

      setEditingId(null);
      await fetchLogs();
      if (onUpdate) onUpdate();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update entry');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) {
      return;
    }

    try {
      setError('');
      await usageAPI.delete(id);
      await fetchLogs();
      if (onUpdate) onUpdate();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete entry');
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Usage History</h3>
        <button onClick={fetchLogs} className="btn-secondary text-sm">
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {logs.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No usage entries yet. Add your first entry above!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium">Date</th>
                <th className="text-left py-3 px-4 font-medium">App</th>
                <th className="text-right py-3 px-4 font-medium">Minutes</th>
                <th className="text-right py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  {editingId === log.id ? (
                    <>
                      <td className="py-3 px-4">
                        <input
                          type="date"
                          value={editForm.date}
                          onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                          className="input-field text-sm"
                          max={format(new Date(), 'yyyy-MM-dd')}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={editForm.appName}
                          onChange={(e) => setEditForm({ 
                            ...editForm, 
                            appName: e.target.value,
                            ...(e.target.value !== 'Other' ? { customAppName: '' } : {})
                          })}
                          className="input-field text-sm"
                        >
                          <option value="">Select an app</option>
                          {APP_OPTIONS.map((app) => (
                            <option key={app} value={app}>
                              {app}
                            </option>
                          ))}
                        </select>
                        {editForm.appName === 'Other' && (
                          <input
                            type="text"
                            value={editForm.customAppName}
                            onChange={(e) => setEditForm({ ...editForm, customAppName: e.target.value })}
                            className="input-field text-sm mt-2"
                            placeholder="Enter app name"
                          />
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          value={editForm.minutesSpent}
                          onChange={(e) => setEditForm({ ...editForm, minutesSpent: e.target.value })}
                          className="input-field text-sm"
                          min="0"
                          max="1440"
                          step="0.01"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleUpdate(log.id)}
                            className="text-sm text-green-600 dark:text-green-400 hover:underline"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-3 px-4">
                        {format(new Date(log.date), 'MMM dd, yyyy')}
                      </td>
                      <td className="py-3 px-4 font-medium">{log.appName}</td>
                      <td className="py-3 px-4 text-right">{formatMinutesToHours(Number(log.minutesSpent || 0))}</td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={() => handleEdit(log)}
                            className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(log.id)}
                            className="text-sm text-red-600 dark:text-red-400 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
