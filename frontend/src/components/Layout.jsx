import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { initDarkMode, toggleDarkMode } from '../utils/darkMode';

export const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setDarkMode(initDarkMode());
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleDarkModeToggle = () => {
    const isDark = toggleDarkMode();
    setDarkMode(isDark);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-yellow-100 to-pink-300">
      {/* Premium Header */}
      <header className="navbar-blur sticky top-0 z-50 animate-slide-down">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex justify-between items-center h-24">
            {/* Premium Logo */}
            <Link to="/dashboard" className="flex items-center space-x-4 group">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500 via-pink-400 to-ocean-500 rounded-2xl flex items-center justify-center transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-2xl shadow-pink-200">
                <svg className="w-8 h-8 text-white group-hover:animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.5 2.5c-.83 0-1.5.67-1.5 1.5v2c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-2c0-.83-.67-1.5-1.5-1.5zM12 2.5c-.83 0-1.5.67-1.5 1.5v2c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-2c0-.83-.67-1.5-1.5-1.5zM5.5 2.5C4.67 2.5 4 3.17 4 4v2c0 .83.67 1.5 1.5 1.5S5.33 6.5 6 6.5V4c0-.83-.67-1.5-1.5-1.5zM18.5 9c-.83 0-1.5.67-1.5 1.5v2c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-2c0-.83-.67-1.5-1.5-1.5zM12 9c-.83 0-1.5.67-1.5 1.5v2c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-2c0-.83-.67-1.5-1.5-1.5zM5.5 9c-.83 0-1.5.67-1.5 1.5v2c0 .83.67 1.5 1.5 1.5S5.33 10.5 6 10.5v-2C7 9.67 6.67 9 9 9c-.83 0-1.5.67-1.5-1.5-1.5zM18.5 15.5c-.83 0-1.5.67-1.5 1.5v2c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-2c0-.83-.67-1.5-1.5-1.5zM12 15.5c-.83 0-1.5.67-1.5 1.5v2c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-2c0-.83-.67-1.5-1.5-1.5zM5.5 15.5c-.83 0-1.5.67-1.5 1.5v2c0 .83.67 1.5 1.5 1.5S5.33 18.5 6 18.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-2c0-.83-.67-1.5-1.5-1.5z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-800 group-hover:text-pink-500 transition-colors duration-300 tracking-tight">
                  Social Analytics
                </h1>
                <p className="text-ocean-600 text-sm font-black group-hover:text-pink-400 transition-colors duration-300">
                  Track your digital life
                </p>
              </div>
            </Link>
            
            {/* Premium Navigation */}
            <nav className="flex items-center space-x-2">
              {user && (
                <>
                  <Link to="/dashboard" className="nav-link">
                    <span className="flex items-center space-x-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001 1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span className="font-semibold">Dashboard</span>
                    </span>
                  </Link>
                  <Link to="/mirror" className="nav-link">
                    <span className="flex items-center space-x-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-9.542 0 012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                      <span className="font-semibold">Mirror</span>
                    </span>
                  </Link>
                  <Link to="/regret-simulator" className="nav-link">
                    <span className="flex items-center space-x-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <span className="font-semibold">Simulator</span>
                    </span>
                  </Link>
                  <Link to="/before-after" className="nav-link">
                    <span className="flex items-center space-x-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4 4" />
                      </svg>
                      <span className="font-semibold">Progress</span>
                    </span>
                  </Link>
                  <Link to="/study-hub" className="nav-link">
                    <span className="flex items-center space-x-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253z" />
                      </svg>
                      <span className="font-semibold">Study Hub</span>
                    </span>
                  </Link>
                </>
              )}
            </nav>
            
            {/* Premium User Actions */}
            <div className="flex items-center space-x-4">
              {user && (
                <>
                  <div className="hidden sm:flex items-center space-x-3 px-6 py-3 bg-white/40 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-xl">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 via-pink-400 to-ocean-500 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-200">
                      <span className="text-white text-lg font-black">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-slate-800 font-black text-sm">
                        {user.username}
                      </span>
                      <span className="text-ocean-600 text-xs font-black uppercase tracking-tighter">
                        Premium User
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleDarkModeToggle}
                    className="p-4 rounded-2xl bg-white/40 backdrop-blur-2xl hover:bg-white/60 border border-white/60 transition-all duration-300 hover:scale-110 hover:shadow-2xl shadow-pink-100"
                    aria-label="Toggle dark mode"
                  >
                    {darkMode ? (
                      <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    )}
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="btn-secondary text-sm font-semibold"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Premium Main Content */}
      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-12 animate-fade-in">
        {children}
      </main>
    </div>
  );
};
