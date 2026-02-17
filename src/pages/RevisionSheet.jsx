import React, { useState } from 'react';
import useLocalStorage from '../utils/useLocalStorage';
import DifficultySelector from '../components/DifficultySelector';
import { getRevisionNotes } from '../services/llmService';
import { saveHistory } from '../services/firestoreService';
import './RevisionSheet.css';

function RevisionSheet() {
  /* Persisted state — revision notes survive navigation (localStorage) */
  const [topic, setTopic] = useLocalStorage('sparklearn_revision_topic', '');
  const [difficulty, setDifficulty] = useLocalStorage('sparklearn_revision_difficulty', 'beginner');
  const [result, setResult] = useLocalStorage('sparklearn_revision_result', null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    try {
      const data = await getRevisionNotes(topic.trim(), difficulty);
      setResult(data);
      await saveHistory({
        id: Date.now().toString(),
        topic: topic.trim(),
        type: 'revision',
        difficulty,
      });
    } catch {
      // handled by service fallback
    }
    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="revision-sheet animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">📝 Revision Sheets</h1>
        <p className="page-subtitle">Generate concise notes for quick revision</p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleGenerate} className="revision-form card-flat">
        <div className="learn-input-row">
          <input
            type="text"
            className="input learn-input"
            placeholder="Enter topic for revision notes..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading || !topic.trim()}>
            {loading ? <span className="auth-spinner" /> : '📄 Generate'}
          </button>
        </div>
        <DifficultySelector value={difficulty} onChange={setDifficulty} />
      </form>

      {/* Loading Skeleton */}
      {loading && (
        <div className="learn-skeleton">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ marginBottom: 24 }}>
              <div className="skeleton" style={{ height: 20, width: '40%', marginBottom: 12 }} />
              <div className="skeleton" style={{ height: 14, width: '100%', marginBottom: 6 }} />
              <div className="skeleton" style={{ height: 14, width: '90%', marginBottom: 6 }} />
              <div className="skeleton" style={{ height: 14, width: '85%' }} />
            </div>
          ))}
        </div>
      )}

      {/* Revision Notes Result */}
      {result && !loading && (
        <div className="revision-result animate-fade-in">
          <div className="revision-header">
            <div>
              <h2 className="result-topic">{result.topic}</h2>
              <span className={`badge ${
                result.difficulty === 'beginner' ? 'badge-success' :
                result.difficulty === 'intermediate' ? 'badge-warning' : 'badge-error'
              }`}>
                {result.difficulty}
              </span>
            </div>
            <button className="btn btn-secondary" onClick={handlePrint}>
              🖨️ Print
            </button>
          </div>

          <div className="revision-notes">
            {result.notes.map((section, i) => (
              <div key={i} className="revision-note-section card-flat animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <h3 className="note-heading">{section.heading}</h3>
                <div className="note-content" dangerouslySetInnerHTML={{
                  __html: section.content.replace(/•/g, '<br />•').replace(/\n/g, '<br />')
                }} />
              </div>
            ))}
          </div>

          <div className="revision-summary card-flat">
            <span className="summary-icon">💡</span>
            <p>{result.summary}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default RevisionSheet;
