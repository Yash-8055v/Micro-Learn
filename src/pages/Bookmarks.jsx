import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBookmarks, removeBookmark } from '../services/firestoreService';
import './Bookmarks.css';

function Bookmarks() {
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBookmarks() {
      setLoading(true);
      try {
        const data = await getBookmarks();
        setBookmarks(data);
      } catch {
        // load failed gracefully
      }
      setLoading(false);
    }
    loadBookmarks();
  }, []);

  const handleRemove = async (id) => {
    try {
      await removeBookmark(id);
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
    } catch {
      // remove failed gracefully
    }
  };

  const handleNavigate = (bookmark) => {
    navigate(`/learn?topic=${encodeURIComponent(bookmark.topic)}`);
  };

  return (
    <div className="bookmarks-page animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">🔖 Bookmarks</h1>
        <p className="page-subtitle">Your saved topics for quick access</p>
      </div>

      {loading ? (
        <div className="bookmarks-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bookmark-card card">
              <div className="skeleton" style={{ height: 120, width: '100%' }} />
            </div>
          ))}
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="empty-state card-flat">
          <span className="empty-icon">🔖</span>
          <h3 className="empty-title">No bookmarks yet</h3>
          <p className="empty-text">
            Start learning topics and bookmark them for quick revision later!
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/learn')}>
            📖 Start Learning
          </button>
        </div>
      ) : (
        <div className="bookmarks-grid">
          {bookmarks.map((bookmark, i) => (
            <div
              key={bookmark.id}
              className={`bookmark-card card animate-fade-in delay-${Math.min(i + 1, 5)}`}
            >
              <div className="bookmark-card-header">
                <span className="bookmark-icon">📘</span>
                <button
                  className="bookmark-remove-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(bookmark.id);
                  }}
                  title="Remove bookmark"
                >
                  ✕
                </button>
              </div>
              <h3 className="bookmark-topic">{bookmark.topic}</h3>
              {bookmark.difficulty && (
                <span className={`badge ${
                  bookmark.difficulty === 'beginner' ? 'badge-success' :
                  bookmark.difficulty === 'intermediate' ? 'badge-warning' : 'badge-error'
                }`}>
                  {bookmark.difficulty}
                </span>
              )}
              <div className="bookmark-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => handleNavigate(bookmark)}>
                  📖 Learn
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/revision`)}>
                  📝 Revise
                </button>
              </div>
              {bookmark.savedAt && (
                <span className="bookmark-date">
                  Saved {new Date(bookmark.savedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Bookmarks;
