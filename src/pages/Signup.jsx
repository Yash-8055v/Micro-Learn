import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import ThemeToggle from '../components/ThemeToggle';
import './Auth.css';

/**
 * Signup — Firebase user registration
 *
 * After signup, creates user profile with displayName.
 * Firestore user doc can be created here too if needed:
 *   import { db } from '../firebase';
 *   import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
 *   await setDoc(doc(db, 'users', cred.user.uid), { name, email, createdAt: serverTimestamp() });
 */
function Signup({ theme, toggleTheme }) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      navigate('/dashboard');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') setError('An account with this email already exists.');
      else if (err.code === 'auth/weak-password') setError('Password is too weak. Use at least 6 characters.');
      else if (err.code === 'auth/invalid-email') setError('Invalid email format.');
      else setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      {/* Theme toggle */}
      <div className="auth-theme-toggle">
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </div>

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
          <p className="auth-tagline">Start your smarter learning journey today</p>
          <div className="auth-features">
            <div className="auth-feature">
              <span>🎯</span>
              <p>Personalized difficulty levels</p>
            </div>
            <div className="auth-feature">
              <span>📅</span>
              <p>AI-generated weekly study plans</p>
            </div>
            <div className="auth-feature">
              <span>📈</span>
              <p>Track your learning progress</p>
            </div>
          </div>
        </div>

        {/* Right panel - Form */}
        <div className="auth-form-panel">
          <h2 className="auth-form-title">Create account</h2>
          <p className="auth-form-subtitle">Join thousands of students learning smarter</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSignup} className="auth-form">
            <div className="input-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                className="input"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="signup-email">Email</label>
              <input
                id="signup-email"
                type="email"
                className="input"
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="signup-password">Password</label>
              <input
                id="signup-password"
                type="password"
                className="input"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="confirm-password">Confirm Password</label>
              <input
                id="confirm-password"
                type="password"
                className="input"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
