import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import ThemeToggle from './ThemeToggle';
import './Navbar.css';

/**
 * Navbar — Top navigation bar with user info & logout
 */
function Navbar({ theme, toggleTheme, onMenuToggle, user }) {
  const navigate = useNavigate();

  /* Generate greeting based on time of day */
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  /* Get display name or email fallback */
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Student';

  return (
    <header className="navbar">
      <div className="navbar-left">
        {/* Mobile hamburger menu */}
        <button className="navbar-menu-btn" onClick={onMenuToggle} aria-label="Toggle menu">
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>

        <div className="navbar-greeting">
          <h2 className="navbar-greeting-text">{getGreeting()}, <span className="gradient-text">{displayName}</span> 👋</h2>
          <p className="navbar-subtitle">Ready to learn something new today?</p>
        </div>
      </div>

      <div className="navbar-right">
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        <button className="btn btn-ghost navbar-logout-btn" onClick={handleLogout} title="Sign out">
          🚪 Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;
