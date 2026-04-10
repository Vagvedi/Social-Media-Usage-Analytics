import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      console.log('[Auth Context] Checking authentication status');
      const response = await authAPI.getMe();
      if (response.data.success && response.data.data?.user) {
        setUser(response.data.data.user);
        console.log('[Auth Context] User authenticated:', response.data.data.user.id);
      }
    } catch (error) {
      console.error('[Auth Context] Auth check failed:', error);
      // Clear invalid tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('[Auth Context] Attempting login');
      
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const response = await authAPI.login({ email, password });
      
      if (response.data.success && response.data.data) {
        const { user: userData, tokens } = response.data.data;
        
        if (!tokens?.accessToken || !tokens?.refreshToken) {
          throw new Error('Server did not return tokens');
        }

        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
        setUser(userData);
        
        console.log('[Auth Context] Login successful');
        return response.data;
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('[Auth Context] Login error:', error);
      
      // Extract error message from response
      const errorMessage = error.response?.data?.message 
        || error.message 
        || 'Login failed. Please try again.';
      
      throw new Error(errorMessage);
    }
  };

  const register = async (username, email, password) => {
    try {
      console.log('[Auth Context] Attempting registration');
      
      if (!username || !email || !password) {
        throw new Error('Username, email, and password are required');
      }

      const response = await authAPI.register({ username, email, password });
      
      if (response.data.success && response.data.data) {
        const { user: userData, tokens } = response.data.data;
        
        if (!tokens?.accessToken || !tokens?.refreshToken) {
          throw new Error('Server did not return tokens');
        }

        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
        setUser(userData);
        
        console.log('[Auth Context] Registration successful');
        return response.data;
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('[Auth Context] Registration error:', error);
      
      // Extract error message from response
      const errorMessage = error.response?.data?.message 
        || error.message 
        || 'Registration failed. Please try again.';
      
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      console.log('[Auth Context] Attempting logout');
      await authAPI.logout();
    } catch (error) {
      console.error('[Auth Context] Logout error:', error);
      // Continue with logout even if API call fails
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      console.log('[Auth Context] Logged out');
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
