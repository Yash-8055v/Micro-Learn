import React from 'react';
import './ThemeToggle.css';

function ThemeToggle({ theme, toggleTheme }) {
  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <span className={`toggle-icon ${theme === 'light' ? 'active' : ''}`}>☀️</span>
      <span className={`toggle-icon ${theme === 'dark' ? 'active' : ''}`}>🌙</span>
      <span className={`toggle-slider ${theme === 'dark' ? 'dark' : ''}`} />
    </button>
  );
}

export default ThemeToggle;
