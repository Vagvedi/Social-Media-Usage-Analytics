import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If token expired and we haven't retried yet
    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED' && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken })
};

// Usage API
export const usageAPI = {
  create: (data) => api.post('/usage', data),
  getAll: (params) => api.get('/usage', { params }),
  getById: (id) => api.get(`/usage/${id}`),
  update: (id, data) => api.put(`/usage/${id}`, data),
  delete: (id) => api.delete(`/usage/${id}`)
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getStats: (params) => api.get('/analytics/stats', { params }),
  getRiskScore: () => api.get('/analytics/risk-score')
};

// Study API
export const studyAPI = {
  // Study Sessions
  startSession: (data) => api.post('/study/sessions/start', data),
  endSession: (sessionId, data) => api.post(`/study/sessions/${sessionId}/end`, data),
  updateSession: (sessionId, data) => api.put(`/study/sessions/${sessionId}`, data),
  deleteSession: (sessionId) => api.delete(`/study/sessions/${sessionId}`),
  getActiveSession: () => api.get('/study/sessions/active'),
  getSessions: (params) => api.get('/study/sessions', { params }),
  
  // Study Goals
  createGoal: (data) => api.post('/study/goals', data),
  getGoals: (params) => api.get('/study/goals', { params }),
  updateGoal: (goalId, data) => api.put(`/study/goals/${goalId}`, data),
  deleteGoal: (goalId) => api.delete(`/study/goals/${goalId}`),
  
  // Study Analytics
  getAnalytics: (params) => api.get('/study/analytics', { params })
};
export default api;
