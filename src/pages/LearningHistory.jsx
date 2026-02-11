import React, { useState, useEffect } from 'react';
import { getHistory, getProgress } from '../services/firestoreService';
import ProgressRing from '../components/ProgressRing';
import './LearningHistory.css';

/**
 * LearningHistory — Shows studied topics, progress, and activity timeline
 *
 * All data loaded from Firestore:
 * - getHistory(): Read from users/{uid}/history
 * - getProgress(): Read from users/{uid}/progress/stats
 */
function LearningHistory() {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({
    topicsStudied: 0,
    quizzesCompleted: 0,
    streak: 0,
    weeklyGoal: 0,
  });
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [historyData, progressData] = await Promise.all([
          getHistory(),
          getProgress(),
        ]);

        setHistory(historyData);

        // Calculate real stats from history + progress
        const topicsStudied = progressData.topicsStudied || historyData.filter((h) => h.type === 'learning').length;
        const quizzesCompleted = progressData.quizzesCompleted || historyData.filter((h) => h.type === 'quiz').length;

        // Calculate streak (consecutive days with activity)
        let streak = progressData.streak || 0;
        if (streak === 0 && historyData.length > 0) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const dates = [...new Set(historyData.map((h) => {
            const d = new Date(h.timestamp);
            d.setHours(0, 0, 0, 0);
            return d.getTime();
          }))].sort((a, b) => b - a);

          const mostRecent = dates[0];
          const diffDays = Math.floor((today.getTime() - mostRecent) / (1000 * 60 * 60 * 24));
          if (diffDays <= 1) {
            streak = 1;
            for (let i = 1; i < dates.length; i++) {
              const diff = Math.floor((dates[i - 1] - dates[i]) / (1000 * 60 * 60 * 24));
              if (diff === 1) streak++;
              else break;
            }
          }
        }

        // Weekly goal = percentage of 7 days with activity this week
        const thisWeekStart = new Date();
        thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
        thisWeekStart.setHours(0, 0, 0, 0);
        const thisWeekDays = new Set(
          historyData
            .filter((h) => new Date(h.timestamp) >= thisWeekStart)
            .map((h) => new Date(h.timestamp).toDateString())
        );
        const weeklyGoal = Math.round((thisWeekDays.size / 7) * 100);

        setStats({
          topicsStudied,
          quizzesCompleted,
          streak,
          weeklyGoal,
        });
      } catch (err) {
        console.error('Error loading history data:', err);
      }
      setLoading(false);
    }

    loadData();
  }, []);

  const filteredHistory = filter === 'all'
    ? history
    : history.filter((item) => item.type === filter);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'learning': return '📖';
      case 'quiz': return '🧩';
      case 'revision': return '📝';
      case 'doubt': return '💬';
      default: return '📋';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'learning': return 'badge-primary';
      case 'quiz': return 'badge-success';
      case 'revision': return 'badge-warning';
      case 'doubt': return 'badge-error';
      default: return 'badge-primary';
    }
  };

  const filters = [
    { key: 'all', label: 'All', icon: '📋' },
    { key: 'learning', label: 'Learning', icon: '📖' },
    { key: 'quiz', label: 'Quizzes', icon: '🧩' },
    { key: 'revision', label: 'Revision', icon: '📝' },
    { key: 'doubt', label: 'Doubts', icon: '💬' },
  ];

  return (
    <div className="learning-history animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">📈 Learning History</h1>
        <p className="page-subtitle">Track your study progress and activity</p>
      </div>

      {/* Stats Overview */}
      {loading ? (
        <div className="history-stats">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="history-stat-card card-flat">
              <div className="skeleton" style={{ height: 60, width: '100%' }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="history-stats">
          <div className="history-stat-card card-flat">
            <ProgressRing progress={stats.weeklyGoal} size={80} label="Weekly" />
          </div>
          <div className="history-stat-card card-flat">
            <div className="stat-big">
              <span className="stat-big-value">{stats.topicsStudied}</span>
              <span className="stat-big-label">Topics Studied</span>
            </div>
          </div>
          <div className="history-stat-card card-flat">
            <div className="stat-big">
              <span className="stat-big-value">{stats.quizzesCompleted}</span>
              <span className="stat-big-label">Quizzes Done</span>
            </div>
          </div>
          <div className="history-stat-card card-flat">
            <div className="stat-big">
              <span className="stat-big-value">{stats.streak}</span>
              <span className="stat-big-label">Day Streak 🔥</span>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="history-filters">
        {filters.map((f) => (
          <button
            key={f.key}
            className={`filter-btn ${filter === f.key ? 'active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            <span>{f.icon}</span> {f.label}
          </button>
        ))}
      </div>

      {/* History Timeline */}
      {loading ? (
        <div className="learn-skeleton">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: 72, width: '100%', marginBottom: 12 }} />
          ))}
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="empty-state card-flat">
          <span className="empty-icon">📈</span>
          <h3 className="empty-title">No activity yet</h3>
          <p className="empty-text">Start studying to see your history here!</p>
        </div>
      ) : (
        <div className="history-timeline">
          {filteredHistory.map((item, i) => (
            <div key={item.id} className={`timeline-item card-flat animate-fade-in delay-${Math.min(i + 1, 5)}`}>
              <div className="timeline-icon-wrap">
                <span className="timeline-icon">{getTypeIcon(item.type)}</span>
                {i < filteredHistory.length - 1 && <div className="timeline-line" />}
              </div>
              <div className="timeline-content">
                <div className="timeline-header">
                  <span className="timeline-topic">{item.topic}</span>
                  <span className={`badge ${getTypeColor(item.type)}`}>{item.type}</span>
                </div>
                <div className="timeline-meta">
                  {item.score !== null && item.score !== undefined && (
                    <span className="timeline-score">Score: {item.score}%</span>
                  )}
                  <span className="timeline-difficulty badge badge-primary">{item.difficulty}</span>
                  <span className="timeline-time">
                    {new Date(item.timestamp).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LearningHistory;
