import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { initDarkMode } from './utils/darkMode';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { DigitalMirrorMode } from './pages/DigitalMirrorMode';
import { FutureRegretSimulator } from './pages/FutureRegretSimulator';
import { BeforeAfterTracking } from './pages/BeforeAfterTracking';
import { useEffect } from 'react';

function App() {
  const { user, loading } = useAuth();

  useEffect(() => {
    initDarkMode();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/dashboard" replace /> : <Register />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/mirror"
        element={
          <ProtectedRoute>
            <Layout>
              <DigitalMirrorMode />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/regret-simulator"
        element={
          <ProtectedRoute>
            <Layout>
              <FutureRegretSimulator />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/before-after"
        element={
          <ProtectedRoute>
            <Layout>
              <BeforeAfterTracking />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
