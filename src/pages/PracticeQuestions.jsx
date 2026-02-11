import React, { useState } from 'react';
import DifficultySelector from '../components/DifficultySelector';
import { generateQuestions } from '../services/llmService';
import { saveHistory, saveProgress, getProgress, saveQuizAttempt } from '../services/firestoreService';
import { adjustDifficulty, getScoreColor, getScoreEmoji } from '../utils/difficultyLogic';
import './PracticeQuestions.css';

function PracticeQuestions() {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('beginner');
  const [questions, setQuestions] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [difficultyResult, setDifficultyResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setSubmitted(false);
    setScore(null);
    setSelectedAnswers({});
    setDifficultyResult(null);

    try {
      const data = await generateQuestions(topic.trim(), difficulty);
      setQuestions(data);
    } catch {
      // handled by service fallback
    }
    setLoading(false);
  };

  const handleSelectAnswer = (questionId, optionIndex) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmitQuiz = async () => {
    if (!questions) return;

    let correct = 0;
    questions.mcqs.forEach((q) => {
      if (selectedAnswers[q.id] === q.correct) correct++;
    });

    const scorePercent = Math.round((correct / questions.mcqs.length) * 100);
    setScore(scorePercent);
    setSubmitted(true);

    // Difficulty adjustment logic
    const result = adjustDifficulty(scorePercent, difficulty);
    setDifficultyResult(result);
    if (result.changed) {
      setDifficulty(result.newLevel);
    }

    // Save to Firestore: history, quiz attempt, and progress
    try {
      const entryId = Date.now().toString();

      await Promise.all([
        saveHistory({
          id: entryId,
          topic: topic.trim(),
          type: 'quiz',
          difficulty,
          score: scorePercent,
        }),
        saveQuizAttempt({
          id: entryId,
          topic: topic.trim(),
          subjectId: topic.trim().toLowerCase().replace(/\s+/g, '-'),
          difficulty,
          score: scorePercent,
          totalQuestions: questions.mcqs.length,
          correctAnswers: correct,
        }),
      ]);

      const progress = await getProgress();
      await saveProgress({
        quizzesCompleted: (progress.quizzesCompleted || 0) + 1,
      });
    } catch {
      // quiz results save failed silently
    }
  };

  return (
    <div className="practice-questions animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">🧩 Practice Questions</h1>
        <p className="page-subtitle">Test your knowledge with AI-generated questions</p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleGenerate} className="practice-form card-flat">
        <div className="learn-input-row">
          <input
            type="text"
            className="input learn-input"
            placeholder="Enter topic for practice questions..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading || !topic.trim()}>
            {loading ? <span className="auth-spinner" /> : '🎯 Generate'}
          </button>
        </div>
        <DifficultySelector value={difficulty} onChange={setDifficulty} />
      </form>

      {/* Loading */}
      {loading && (
        <div className="learn-skeleton">
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ marginBottom: 32 }}>
              <div className="skeleton" style={{ height: 20, width: '80%', marginBottom: 16 }} />
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="skeleton" style={{ height: 40, width: '100%', marginBottom: 8 }} />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Score Banner */}
      {submitted && score !== null && (
        <div className={`score-banner ${getScoreColor(score)} animate-scale-in`}>
          <div className="score-display">
            <span className="score-emoji">{getScoreEmoji(score)}</span>
            <div>
              <span className="score-value">{score}%</span>
              <span className="score-label">Score</span>
            </div>
          </div>
          {difficultyResult && (
            <p className="difficulty-message">{difficultyResult.message}</p>
          )}
        </div>
      )}

      {/* MCQ Questions */}
      {questions && !loading && (
        <div className="questions-list">
          <h3 className="questions-heading">Multiple Choice Questions</h3>
          {questions.mcqs.map((q, i) => (
            <div key={q.id} className={`question-card card-flat animate-fade-in delay-${i + 1}`}>
              <p className="question-number">Question {i + 1}</p>
              <p className="question-text">{q.question}</p>
              <div className="options-list">
                {q.options.map((opt, j) => {
                  let optionClass = 'option-btn';
                  if (selectedAnswers[q.id] === j) optionClass += ' selected';
                  if (submitted) {
                    if (j === q.correct) optionClass += ' correct';
                    else if (selectedAnswers[q.id] === j && j !== q.correct) optionClass += ' incorrect';
                  }
                  return (
                    <button
                      key={j}
                      className={optionClass}
                      onClick={() => handleSelectAnswer(q.id, j)}
                      disabled={submitted}
                    >
                      <span className="option-letter">{String.fromCharCode(65 + j)}</span>
                      <span className="option-text">{opt}</span>
                    </button>
                  );
                })}
              </div>
              {submitted && (
                <div className="explanation animate-fade-in">
                  <strong>Explanation:</strong> {q.explanation}
                </div>
              )}
            </div>
          ))}


          {/* Submit Button */}
          {!submitted && (
            <button
              className="btn btn-primary btn-lg submit-quiz-btn"
              onClick={handleSubmitQuiz}
              disabled={Object.keys(selectedAnswers).length < questions.mcqs.length}
            >
              ✅ Submit Answers
            </button>
          )}

          {submitted && (
            <button className="btn btn-primary btn-lg submit-quiz-btn" onClick={handleGenerate}>
              🔄 Try New Questions
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default PracticeQuestions;
