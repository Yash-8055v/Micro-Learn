import React, { useState, useEffect } from 'react';
import DifficultySelector from '../components/DifficultySelector';
import { getTopicExplanation } from '../services/llmService';
import { saveBookmark, getBookmarks, removeBookmark, saveHistory } from '../services/firestoreService';
import './TopicLearning.css';

function TopicLearning() {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('beginner');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);

  /* Load bookmarks from Firestore on mount */
  useEffect(() => {
    async function loadBookmarks() {
      try {
        const data = await getBookmarks();
        setBookmarks(data);
      } catch {
        // handled gracefully
      }
    }
    loadBookmarks();
  }, []);

  /* Read topic from URL query params if present */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlTopic = params.get('topic');
    if (urlTopic) {
      setTopic(urlTopic);
    }
  }, []);

  const handleLearn = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    try {
      const data = await getTopicExplanation(topic.trim(), difficulty);
      setResult(data);

      // Save to history
      await saveHistory({
        id: Date.now().toString(),
        topic: topic.trim(),
        type: 'learning',
        difficulty,
      });
    } catch {
      // handled by service fallback
    }
    setLoading(false);
  };

  const handleBookmark = async () => {
    const id = topic.trim().toLowerCase().replace(/\s+/g, '-');
    const isBookmarked = bookmarks.some((b) => b.id === id);
    try {
      if (isBookmarked) {
        await removeBookmark(id);
        setBookmarks((prev) => prev.filter((b) => b.id !== id));
      } else {
        const saved = await saveBookmark({ id, topic: topic.trim(), difficulty });
        setBookmarks((prev) => [...prev, saved]);
      }
    } catch {
      // handled gracefully
    }
  };

  const isBookmarked = bookmarks.some(
    (b) => b.id === topic.trim().toLowerCase().replace(/\s+/g, '-')
  );

  return (
    <div className="topic-learning animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">📖 Learn a Topic</h1>
        <p className="page-subtitle">Get AI-powered explanations tailored to your level</p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleLearn} className="learn-form card-flat">
        <div className="learn-input-row">
          <input
            type="text"
            className="input learn-input"
            placeholder="Enter any topic... (e.g., Data Structures, Organic Chemistry)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading || !topic.trim()}>
            {loading ? <span className="auth-spinner" /> : '✨ Explain'}
          </button>
        </div>

        <DifficultySelector value={difficulty} onChange={setDifficulty} />
      </form>

      {/* Loading Skeleton */}
      {loading && (
        <div className="learn-skeleton">
          <div className="skeleton" style={{ height: 24, width: '60%', marginBottom: 16 }} />
          <div className="skeleton" style={{ height: 16, width: '100%', marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 16, width: '90%', marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 16, width: '95%', marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 16, width: '80%' }} />
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="learn-result animate-fade-in">
          <div className="result-header">
            <div>
              <h2 className="result-topic">{result.topic}</h2>
              <span className={`badge ${
                result.difficulty === 'beginner' ? 'badge-success' :
                result.difficulty === 'intermediate' ? 'badge-warning' : 'badge-error'
              }`}>
                {result.difficulty}
              </span>
            </div>
            <button
              className={`btn btn-ghost bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
              onClick={handleBookmark}
            >
              {isBookmarked ? '★ Bookmarked' : '☆ Bookmark'}
            </button>
          </div>

          {/* Explanation */}
          <div className="result-section card-flat">
            <h3 className="result-section-title">💡 Explanation</h3>
            <div className="result-content" dangerouslySetInnerHTML={{
              __html: result.explanation.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />')
            }} />
          </div>

          {/* Example */}
          <div className="result-section card-flat">
            <h3 className="result-section-title">🌍 Real-World Example</h3>
            <p className="result-content">{result.example}</p>
          </div>

          {/* Micro Task */}
          <div className="result-section card-flat micro-task">
            <h3 className="result-section-title">📝 Today's Micro-Task</h3>
            <div className="result-content" dangerouslySetInnerHTML={{
              __html: result.microTask.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />')
            }} />
          </div>
        </div>
      )}
    </div>
  );
}

export default TopicLearning;
