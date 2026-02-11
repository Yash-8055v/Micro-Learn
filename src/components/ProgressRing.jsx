import React from 'react';
import './ProgressRing.css';

/**
 * ProgressRing — Animated circular progress indicator.
 *
 * Used in Dashboard and Learning History for visual progress display.
 *
 * @param {number} progress - 0 to 100
 * @param {number} size - Diameter in pixels
 * @param {string} label - Text inside the ring
 */
function ProgressRing({ progress = 0, size = 100, label = '' }) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="progress-ring-container" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="progress-ring-svg">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="progress-ring-bg"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="progress-ring-fill"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="progress-ring-label">
        <span className="progress-ring-value">{Math.round(progress)}%</span>
        {label && <span className="progress-ring-text">{label}</span>}
      </div>
    </div>
  );
}

export default ProgressRing;
