import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './Sidebar.css';

/**
 * Sidebar — Main navigation component
 *
 * Contains links to all app pages.
 * Collapses on mobile (controlled by isOpen prop).
 */

const navItems = [
  { path: '/dashboard', icon: '📊', label: 'Dashboard' },
  { path: '/learn', icon: '📖', label: 'Learn Topic' },
  { path: '/doubt', icon: '💬', label: 'Ask Doubt' },
  { path: '/revision', icon: '📝', label: 'Revision Sheets' },
  { path: '/practice', icon: '🧩', label: 'Practice' },
  { path: '/weekly-plan', icon: '📅', label: 'Weekly Plan' },
  { path: '/bookmarks', icon: '🔖', label: 'Bookmarks' },
  { path: '/history', icon: '📈', label: 'History' },
];

function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <span className="sidebar-logo-icon">⚡</span>
          <span className="sidebar-logo-text">SparkLearn</span>
        </div>

        {/* Navigation links */}
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              onClick={onClose}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              <span className="sidebar-link-label">{item.label}</span>
              {/* Active indicator */}
              {location.pathname === item.path && (
                <span className="sidebar-active-indicator" />
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">S</div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">Student</span>
              <span className="sidebar-user-email">student@email.com</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
