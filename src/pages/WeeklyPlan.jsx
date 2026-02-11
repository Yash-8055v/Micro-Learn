import React, { useState } from 'react';
import { generateWeeklyPlan } from '../services/llmService';
import './WeeklyPlan.css';

function WeeklyPlan() {
  const [subjects, setSubjects] = useState('');
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!subjects.trim()) return;

    setLoading(true);
    try {
      const subjectList = subjects.split(',').map((s) => s.trim()).filter(Boolean);
      const data = await generateWeeklyPlan(subjectList);
      setPlan(data);
    } catch {
      // handled by llmService fallback
    }
    setLoading(false);
  };

  const getTaskTypeIcon = (type) => {
    switch (type) {
      case 'study': return '📖';
      case 'practice': return '🧩';
      case 'revision': return '📝';
      case 'review': return '🔍';
      case 'break': return '☕';
      default: return '📋';
    }
  };

  const getTaskTypeClass = (type) => {
    switch (type) {
      case 'study': return 'task-study';
      case 'practice': return 'task-practice';
      case 'revision': return 'task-revision';
      case 'review': return 'task-review';
      case 'break': return 'task-break';
      default: return '';
    }
  };

  return (
    <div className="weekly-plan animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">📅 Weekly Study Plan</h1>
        <p className="page-subtitle">Get an AI-generated personalized study schedule</p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleGenerate} className="plan-form card-flat">
        <div className="learn-input-row">
          <input
            type="text"
            className="input learn-input"
            placeholder="Enter subjects (comma-separated)... e.g., Math, Physics, Chemistry"
            value={subjects}
            onChange={(e) => setSubjects(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading || !subjects.trim()}>
            {loading ? <span className="auth-spinner" /> : '📅 Generate Plan'}
          </button>
        </div>
      </form>

      {/* Loading */}
      {loading && (
        <div className="plan-loading">
          {[1, 2, 3].map((i) => (
            <div key={i} className="learn-skeleton" style={{ marginBottom: 16 }}>
              <div className="skeleton" style={{ height: 24, width: '30%', marginBottom: 12 }} />
              <div className="skeleton" style={{ height: 48, width: '100%', marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 48, width: '100%', marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 48, width: '100%' }} />
            </div>
          ))}
        </div>
      )}

      {/* Plan Result */}
      {plan && !loading && (
        <div className="plan-result animate-fade-in">
          {/* Subject Tags */}
          <div className="plan-subjects">
            <span className="plan-subjects-label">Subjects:</span>
            {plan.subjects.map((s, i) => (
              <span key={i} className="badge badge-primary">{s}</span>
            ))}
          </div>

          {/* Day Cards */}
          <div className="plan-days">
            {plan.plan.map((day, i) => (
              <div key={day.day} className={`day-card card-flat animate-fade-in delay-${Math.min(i + 1, 5)}`}>
                <h3 className="day-name">{day.day}</h3>
                <div className="day-tasks">
                  {day.tasks.map((task, j) => (
                    <div key={j} className={`day-task ${getTaskTypeClass(task.type)}`}>
                      <span className="task-time">{task.time}</span>
                      <span className="task-icon">{getTaskTypeIcon(task.type)}</span>
                      <div className="task-info">
                        <span className="task-name">{task.task}</span>
                        <span className="task-duration">{task.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Tips */}
          <div className="plan-tips card-flat">
            <h3 className="tips-title">💡 Study Tips</h3>
            <ul className="tips-list">
              {plan.tips.map((tip, i) => (
                <li key={i} className="tip-item">{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default WeeklyPlan;
