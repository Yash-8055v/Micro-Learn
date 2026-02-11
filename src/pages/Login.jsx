import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, googleProvider } from '../firebase';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import ThemeToggle from '../components/ThemeToggle';
import './Auth.css';

/**
 * Login — Firebase Email/Password + Google sign-in
 */
function Login({ theme, toggleTheme }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      // Friendly error messages
      if (err.code === 'auth/user-not-found') setError('No account found with this email.');
      else if (err.code === 'auth/wrong-password') setError('Incorrect password.');
      else if (err.code === 'auth/invalid-email') setError('Invalid email format.');
      else if (err.code === 'auth/invalid-credential') setError('Invalid email or password.');
      else setError(err.message);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard');
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message);
      }
    }
  };

  return (
    <div className="auth-page">
      {/* Theme toggle */}
      <div className="auth-theme-toggle">
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </div>

      {/* Background decoration */}
      <div className="auth-bg-decoration">
        <div className="auth-bg-circle circle-1" />
        <div className="auth-bg-circle circle-2" />
        <div className="auth-bg-circle circle-3" />
      </div>

      <div className="auth-container animate-scale-in">
        {/* Left panel - Branding */}
        <div className="auth-branding">
          <div className="auth-logo">
            <span className="auth-logo-icon">⚡</span>
            <h1 className="auth-logo-text">SparkLearn</h1>
          </div>
          <p className="auth-tagline">AI-powered micro-learning for college students</p>
          <div className="auth-features">
            <div className="auth-feature">
              <span>📖</span>
              <p>Learn any topic with AI explanations</p>
            </div>
            <div className="auth-feature">
              <span>💬</span>
              <p>Get your doubts cleared instantly</p>
            </div>
            <div className="auth-feature">
              <span>📝</span>
              <p>Generate revision sheets & practice</p>
            </div>
          </div>
        </div>

        {/* Right panel - Form */}
        <div className="auth-form-panel">
          <h2 className="auth-form-title">Welcome back</h2>
          <p className="auth-form-subtitle">Sign in to continue your learning journey</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleLogin} className="auth-form">
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
              {loading ? (
                <span className="auth-spinner" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <button className="btn btn-secondary btn-lg auth-google" onClick={handleGoogleLogin}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <p className="auth-switch">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
