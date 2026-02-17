import React, { useState, useEffect, useCallback } from 'react';
import { saveNote, getNotes, deleteNote } from '../services/firestoreService';
import './NotesSection.css';

/**
 * NotesSection — Reusable note-taking component linked to a topic.
 *
 * Props:
 *   - topic (string): The current topic to attach notes to.
 *
 * Features:
 *   - Textarea for writing notes
 *   - "Save Notes" button persists to Firebase
 *   - "Last saved" timestamp shown after saving
 *   - Notes clear when topic changes
 *   - Previous notes fetched from Firebase and displayed as cards
 */
function NotesSection({ topic }) {
  const [noteText, setNoteText] = useState('');
  const [lastSaved, setLastSaved] = useState(null);
  const [saving, setSaving] = useState(false);
  const [allNotes, setAllNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(true);

  /* Fetch all previous notes from Firestore on mount */
  const fetchNotes = useCallback(async () => {
    setLoadingNotes(true);
    try {
      const notes = await getNotes();
      setAllNotes(notes);
    } catch {
      // handled gracefully
    }
    setLoadingNotes(false);
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  /* Clear the editor when the topic changes */
  useEffect(() => {
    setNoteText('');
    setLastSaved(null);
  }, [topic]);

  /* Save note to Firestore */
  const handleSave = async () => {
    if (!noteText.trim() || !topic?.trim()) return;

    setSaving(true);
    try {
      const id = topic.trim().toLowerCase().replace(/\s+/g, '-');
      const saved = await saveNote({
        id,
        topic: topic.trim(),
        content: noteText.trim(),
      });

      setLastSaved(saved.savedAt);

      /* Refresh the notes list so the new note appears immediately */
      await fetchNotes();
    } catch {
      // handled gracefully
    }
    setSaving(false);
  };

  /* Delete a note */
  const handleDelete = async (noteId) => {
    try {
      await deleteNote(noteId);
      setAllNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch {
      // handled gracefully
    }
  };

  /* Format an ISO timestamp into a friendly string */
  const formatTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  if (!topic || !topic.trim()) return null;

  return (
    <div className="notes-section animate-fade-in">

      {/* ---- Note Editor ---- */}
      <div className="notes-editor result-section card-flat">
        <h3 className="result-section-title">📝 My Notes</h3>

        <textarea
          className="notes-textarea"
          placeholder={`Write your notes on "${topic.trim()}"…`}
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          rows={5}
        />

        <div className="notes-actions">
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving || !noteText.trim()}
          >
            {saving ? <span className="auth-spinner" /> : '💾 Save Notes'}
          </button>

          {lastSaved && (
            <span className="notes-saved-time">
              Last saved: {formatTime(lastSaved)}
            </span>
          )}
        </div>
      </div>

      {/* ---- Previous Notes List ---- */}
      <div className="notes-history result-section card-flat">
        <h3 className="result-section-title">🗂️ Previous Notes</h3>

        {loadingNotes && (
          <div className="notes-loading">
            <div className="skeleton" style={{ height: 16, width: '80%', marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 16, width: '60%' }} />
          </div>
        )}

        {!loadingNotes && allNotes.length === 0 && (
          <p className="notes-empty">No saved notes yet. Start writing above!</p>
        )}

        {!loadingNotes && allNotes.length > 0 && (
          <ul className="notes-list">
            {allNotes.map((note) => (
              <li key={note.id} className="notes-card">
                <div className="notes-card__header">
                  <strong className="notes-card__topic">{note.topic}</strong>
                  <span className="notes-card__time">{formatTime(note.savedAt)}</span>
                </div>
                <p className="notes-card__content">{note.content}</p>
                <button
                  className="btn btn-ghost notes-card__delete"
                  onClick={() => handleDelete(note.id)}
                >
                  🗑️ Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default NotesSection;
