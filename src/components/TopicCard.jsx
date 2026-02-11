import React from 'react';
import './TopicCard.css';

/**
 * TopicCard — Displays a study topic with a bookmark toggle.
 *
 * Used on Dashboard and Bookmarks pages.
 */
function TopicCard({ topic, isBookmarked, onBookmark, onClick }) {
  return (
    <div className="topic-card card" onClick={onClick}>
      <div className="topic-card-header">
        <span className="topic-card-icon">{topic.icon || '📘'}</span>
        <button
          className={`topic-bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onBookmark && onBookmark(topic);
          }}
          aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark topic'}
        >
          {isBookmarked ? '★' : '☆'}
        </button>
      </div>
      <h3 className="topic-card-title">{topic.name}</h3>
      <span className="topic-card-category badge badge-primary">{topic.category}</span>
    </div>
  );
}

export default TopicCard;
