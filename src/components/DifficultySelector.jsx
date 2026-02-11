import React from 'react';
import './DifficultySelector.css';

const levels = [
  { key: 'beginner', label: 'Beginner', emoji: '🌱', color: 'var(--success)' },
  { key: 'intermediate', label: 'Intermediate', emoji: '🌿', color: 'var(--warning)' },
  { key: 'advanced', label: 'Advanced', emoji: '🌳', color: 'var(--accent)' },
];

function DifficultySelector({ value, onChange }) {
  return (
    <div className="difficulty-selector">
      {levels.map((level) => (
        <button
          key={level.key}
          className={`difficulty-btn ${value === level.key ? 'active' : ''}`}
          onClick={() => onChange(level.key)}
          style={{ '--level-color': level.color }}
        >
          <span className="difficulty-emoji">{level.emoji}</span>
          <span className="difficulty-label">{level.label}</span>
        </button>
      ))}
    </div>
  );
}

export default DifficultySelector;
