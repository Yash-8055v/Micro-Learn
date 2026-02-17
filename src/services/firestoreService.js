import { db, auth } from '../firebase';
import {
  collection, doc, setDoc, getDoc, getDocs, deleteDoc,
} from 'firebase/firestore';

function getUid() {
  return auth.currentUser?.uid;
}

// Bookmarks

export async function saveBookmark(bookmark) {
  const uid = getUid();
  if (!uid) throw new Error('User not logged in');

  const bookmarkData = {
    ...bookmark,
    savedAt: new Date().toISOString(),
  };

  await setDoc(doc(db, `users/${uid}/bookmarks`, bookmark.id), bookmarkData);
  return bookmarkData;
}

export async function removeBookmark(bookmarkId) {
  const uid = getUid();
  if (!uid) throw new Error('User not logged in');
  await deleteDoc(doc(db, `users/${uid}/bookmarks`, bookmarkId));
}

export async function getBookmarks() {
  const uid = getUid();
  if (!uid) return [];

  try {
    const snap = await getDocs(collection(db, `users/${uid}/bookmarks`));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch {
    return [];
  }
}

// History

export async function saveHistory(entry) {
  const uid = getUid();
  if (!uid) return;

  const historyEntry = {
    ...entry,
    timestamp: entry.timestamp || new Date().toISOString(),
  };

  await setDoc(doc(db, `users/${uid}/history`, entry.id), historyEntry);
}

export async function getHistory() {
  const uid = getUid();
  if (!uid) return [];

  try {
    const snap = await getDocs(collection(db, `users/${uid}/history`));
    const history = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return history;
  } catch {
    return [];
  }
}

// Quiz Attempts

export async function saveQuizAttempt(attempt) {
  const uid = getUid();
  if (!uid) return;

  const attemptData = {
    ...attempt,
    quizDate: new Date().toISOString(),
  };

  await setDoc(doc(db, `users/${uid}/quizAttempts`, attempt.id), attemptData);
}

export async function getQuizAttempts() {
  const uid = getUid();
  if (!uid) return [];

  try {
    const snap = await getDocs(collection(db, `users/${uid}/quizAttempts`));
    const attempts = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    attempts.sort((a, b) => new Date(b.quizDate) - new Date(a.quizDate));
    return attempts;
  } catch {
    return [];
  }
}

// Progress

export async function saveProgress(progress) {
  const uid = getUid();
  if (!uid) return;

  const progressData = {
    ...progress,
    updatedOn: new Date().toISOString(),
  };

  await setDoc(doc(db, `users/${uid}/progress`, 'stats'), progressData, { merge: true });
}

export async function getProgress() {
  const uid = getUid();
  if (!uid) return { topicsStudied: 0, quizzesCompleted: 0, streak: 0, totalStudyTime: 0 };

  try {
    const snap = await getDoc(doc(db, `users/${uid}/progress`, 'stats'));
    if (snap.exists()) {
      return snap.data();
    }
    return { topicsStudied: 0, quizzesCompleted: 0, streak: 0, totalStudyTime: 0 };
  } catch {
    return { topicsStudied: 0, quizzesCompleted: 0, streak: 0, totalStudyTime: 0 };
  }
}

// Notes

export async function saveNote(note) {
  const uid = getUid();
  if (!uid) throw new Error('User not logged in');

  const noteData = {
    ...note,
    savedAt: new Date().toISOString(),
  };

  await setDoc(doc(db, `users/${uid}/notes`, note.id), noteData);
  return noteData;
}

export async function getNotes() {
  const uid = getUid();
  if (!uid) return [];

  try {
    const snap = await getDocs(collection(db, `users/${uid}/notes`));
    const notes = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    notes.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
    return notes;
  } catch {
    return [];
  }
}

export async function deleteNote(noteId) {
  const uid = getUid();
  if (!uid) throw new Error('User not logged in');
  await deleteDoc(doc(db, `users/${uid}/notes`, noteId));
}
