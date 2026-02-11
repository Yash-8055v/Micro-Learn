import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

/* ---- Page Imports ---- */
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import TopicLearning from './pages/TopicLearning';
import DoubtHelper from './pages/DoubtHelper';
import RevisionSheet from './pages/RevisionSheet';
import PracticeQuestions from './pages/PracticeQuestions';
import WeeklyPlan from './pages/WeeklyPlan';
import Bookmarks from './pages/Bookmarks';
import LearningHistory from './pages/LearningHistory';

function App() {
  /* ---- Auth state ---- */
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  /* ---- Theme state (persisted to localStorage) ---- */
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('sparklearn_theme') || 'light';
  });

  /* ---- Sidebar state for mobile ---- */
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* Apply theme to <html> element */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sparklearn_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  /* Loading screen while checking auth */
  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font)',
        gap: '12px',
      }}>
        <span style={{ fontSize: 32 }}>⚡</span>
        <span style={{ fontSize: 20, fontWeight: 700 }}>Loading SparkLearn...</span>
      </div>
    );
  }

  /* Layout wrapper for authenticated pages */
  const AuthenticatedLayout = ({ children }) => {
    if (!user) return <Navigate to="/login" replace />;
    return (
      <div className="app-layout">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="app-main">
          <Navbar
            theme={theme}
            toggleTheme={toggleTheme}
            onMenuToggle={() => setSidebarOpen((prev) => !prev)}
            user={user}
          />
          <div className="page-content">
            {children}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Router>
      <Routes>
        {/* Public routes — redirect to dashboard if already logged in */}
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login theme={theme} toggleTheme={toggleTheme} />} />
        <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <Signup theme={theme} toggleTheme={toggleTheme} />} />

        {/* Protected routes (wrapped in layout) */}
        <Route path="/dashboard" element={<AuthenticatedLayout><Dashboard /></AuthenticatedLayout>} />
        <Route path="/learn" element={<AuthenticatedLayout><TopicLearning /></AuthenticatedLayout>} />
        <Route path="/doubt" element={<AuthenticatedLayout><DoubtHelper /></AuthenticatedLayout>} />
        <Route path="/revision" element={<AuthenticatedLayout><RevisionSheet /></AuthenticatedLayout>} />
        <Route path="/practice" element={<AuthenticatedLayout><PracticeQuestions /></AuthenticatedLayout>} />
        <Route path="/weekly-plan" element={<AuthenticatedLayout><WeeklyPlan /></AuthenticatedLayout>} />
        <Route path="/bookmarks" element={<AuthenticatedLayout><Bookmarks /></AuthenticatedLayout>} />
        <Route path="/history" element={<AuthenticatedLayout><LearningHistory /></AuthenticatedLayout>} />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
