import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import ProgressRing from '../components/ProgressRing';
import TopicCard from '../components/TopicCard';
import { sampleTopics, motivationalQuotes } from '../utils/mockData';
import { getBookmarks, saveBookmark, removeBookmark, getHistory, getProgress } from '../services/firestoreService';
import './Dashboard.css';

/**
 * Dashboard — Main overview page
 *
 * All user data loaded from Firestore.
 * Stats are computed from real history entries.
 */
function Dashboard() {
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    topicsStudied: 0,
    quizzesCompleted: 0,
    streak: 0,
    averageScore: 0,
    totalStudyTime: 0,
    weeklyGoal: 0,
  });
  const [quote] = useState(() =>
    motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]
  );

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [storedBookmarks, storedHistory, storedProgress] = await Promise.all([
          getBookmarks(),
          getHistory(),
          getProgress(),
        ]);

        setBookmarks(storedBookmarks);
        setHistory(storedHistory);

        // Calculate stats from real data
        const topicsStudied = storedHistory.filter((h) => h.type === 'learning').length;
        const quizzesCompleted = storedHistory.filter((h) => h.type === 'quiz').length;
        const quizScores = storedHistory
          .filter((h) => h.type === 'quiz' && h.score !== null && h.score !== undefined)
          .map((h) => h.score);
        const averageScore = quizScores.length > 0
          ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
          : 0;

        // Calculate streak (consecutive days with activity)
        let streak = storedProgress.streak || 0;
        if (streak === 0 && storedHistory.length > 0) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const dates = [...new Set(storedHistory.map((h) => {
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
          storedHistory
            .filter((h) => new Date(h.timestamp) >= thisWeekStart)
            .map((h) => new Date(h.timestamp).toDateString())
        );
        const weeklyGoal = Math.round((thisWeekDays.size / 7) * 100);

        setStats({
          topicsStudied: storedProgress.topicsStudied || topicsStudied,
          quizzesCompleted: storedProgress.quizzesCompleted || quizzesCompleted,
          streak,
          averageScore,
          totalStudyTime: storedProgress.totalStudyTime || topicsStudied * 15,
          weeklyGoal,
        });
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      }
      setLoading(false);
    }

    loadData();
  }, []);

  const handleBookmark = async (topic) => {
    const isBookmarked = bookmarks.some((b) => b.id === topic.id);
    try {
      if (isBookmarked) {
        await removeBookmark(topic.id);
        setBookmarks((prev) => prev.filter((b) => b.id !== topic.id));
      } else {
        const saved = await saveBookmark({ id: topic.id, topic: topic.name, difficulty: 'beginner' });
        setBookmarks((prev) => [...prev, saved]);
      }
    } catch (err) {
      console.error('Bookmark error:', err);
    }
  };

  const statCards = [
    { label: 'Study Streak', value: stats.streak > 0 ? `${stats.streak} days` : '0 days', icon: '🔥', color: 'var(--accent)' },
    { label: 'Topics Studied', value: stats.topicsStudied, icon: '📖', color: 'var(--primary)' },
    { label: 'Quizzes Done', value: stats.quizzesCompleted, icon: '🧩', color: 'var(--success)' },
    { label: 'Avg Score', value: stats.averageScore > 0 ? `${stats.averageScore}%` : '—', icon: '📊', color: 'var(--warning)' },
  ];

  const quickActions = [
    { label: 'Learn a Topic', icon: '📖', path: '/learn', color: 'var(--primary)' },
    { label: 'Ask a Doubt', icon: '💬', path: '/doubt', color: 'var(--accent)' },
    { label: 'Revision Sheet', icon: '📝', path: '/revision', color: 'var(--success)' },
    { label: 'Practice Quiz', icon: '🧩', path: '/practice', color: 'var(--warning)' },
    { label: 'Weekly Plan', icon: '📅', path: '/weekly-plan', color: '#8B5CF6' },
  ];

  const getTypeColor = (type) => {
    switch (type) {
      case 'learning': return 'badge-primary';
      case 'quiz': return 'badge-success';
      case 'revision': return 'badge-warning';
      case 'doubt': return 'badge-error';
      default: return 'badge-primary';
    }
  };

  /* User's display name from Firebase Auth */
  const displayName = auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'Student';

  return (
    <div className="dashboard animate-fade-in">
      {/* Motivational Quote Banner */}
      <div className="dashboard-quote">
        <p className="quote-text">"{quote.text}"</p>
        <span className="quote-author">— {quote.author}</span>
      </div>

      {/* Stat Cards */}
      <div className="dashboard-stats">
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="stat-card card">
              <div className="skeleton" style={{ height: 60, width: '100%' }} />
            </div>
          ))
        ) : (
          statCards.map((stat, i) => (
            <div key={stat.label} className={`stat-card card delay-${i + 1} animate-fade-in`}>
              <div className="stat-icon" style={{ background: `color-mix(in srgb, ${stat.color} 12%, transparent)` }}>
                <span>{stat.icon}</span>
              </div>
              <div className="stat-info">
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Actions & Progress */}
      <div className="dashboard-grid">
        <div className="dashboard-section">
          <h3 className="section-title">Quick Actions</h3>
          <div className="quick-actions">
            {quickActions.map((action) => (
              <button
                key={action.label}
                className="quick-action-btn"
                onClick={() => navigate(action.path)}
                style={{ '--action-color': action.color }}
              >
                <span className="quick-action-icon">{action.icon}</span>
                <span className="quick-action-label">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="dashboard-section progress-section">
          <h3 className="section-title">Weekly Progress</h3>
          <div className="progress-display">
            <ProgressRing progress={stats.weeklyGoal} size={120} label="Complete" />
            <div className="progress-details">
              <p className="progress-stat">
                <span className="progress-stat-value">{Math.round(stats.totalStudyTime / 60) || 0}h</span>
                <span className="progress-stat-label">Study time</span>
              </p>
              <p className="progress-stat">
                <span className="progress-stat-value">{stats.topicsStudied}</span>
                <span className="progress-stat-label">Topics covered</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="dashboard-section">
        <h3 className="section-title">Recent Activity</h3>
        {loading ? (
          <div className="learn-skeleton">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: 56, width: '100%', marginBottom: 8 }} />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="empty-activity card-flat">
            <span style={{ fontSize: 32, opacity: 0.5 }}>📚</span>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              No activity yet. Start learning to see your history here!
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/learn')}>
              📖 Start Learning
            </button>
          </div>
        ) : (
          <div className="activity-list">
            {history.slice(0, 5).map((item) => (
              <div key={item.id} className="activity-item card-flat">
                <div className="activity-info">
                  <span className="activity-topic">{item.topic}</span>
                  <span className={`badge ${getTypeColor(item.type)}`}>{item.type}</span>
                </div>
                <div className="activity-meta">
                  {item.score !== null && item.score !== undefined && (
                    <span className="activity-score">{item.score}%</span>
                  )}
                  <span className="activity-time">
                    {new Date(item.timestamp).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Popular Topics */}
      <div className="dashboard-section">
        <h3 className="section-title">Popular Topics</h3>
        <div className="topics-grid">
          {sampleTopics.slice(0, 4).map((topic) => (
            <TopicCard
              key={topic.id}
              topic={topic}
              isBookmarked={bookmarks.some((b) => b.id === topic.id)}
              onBookmark={handleBookmark}
              onClick={() => navigate(`/learn?topic=${encodeURIComponent(topic.name)}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
