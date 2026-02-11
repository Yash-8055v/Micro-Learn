/**
 * ============================================
 * Firestore Service — SparkLearn
 * ============================================
 *
 * All data persistence via Firebase Firestore.
 * Each user's data is stored under users/{uid}/...
 * Theme preference is the ONLY thing in localStorage.
 *
 * FIRESTORE STRUCTURE (per ER diagram):
 * users/{uid}/bookmarks/{bookmarkId}
 * users/{uid}/history/{entryId}
 * users/{uid}/quizAttempts/{attemptId}
 * users/{uid}/progress/stats
 */

import { db, auth } from '../firebase';
import {
  collection, doc, setDoc, getDoc, getDocs,
  deleteDoc, query, orderBy, limit,
} from 'firebase/firestore';

// ---- Helper ----
function getUid() {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    console.warn('⚠️ SparkLearn: No user logged in (auth.currentUser is null)');
  }
  return uid;
}

// ==================================
// Bookmarks
// ==================================

/**
 * Save a bookmark to Firestore.
 */
export async function saveBookmark(bookmark) {
  const uid = getUid();
  if (!uid) throw new Error('User not logged in');

  const bookmarkData = {
    ...bookmark,
    savedAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, `users/${uid}/bookmarks`, bookmark.id), bookmarkData);
    console.log('✅ Bookmark saved to Firestore:', bookmark.id);
    return bookmarkData;
  } catch (err) {
    console.error('❌ Firestore saveBookmark FAILED:', err.code, err.message);
    throw err;
  }
}

/**
 * Remove a bookmark from Firestore.
 */
export async function removeBookmark(bookmarkId) {
  const uid = getUid();
  if (!uid) throw new Error('User not logged in');

  try {
    await deleteDoc(doc(db, `users/${uid}/bookmarks`, bookmarkId));
    console.log('✅ Bookmark removed from Firestore:', bookmarkId);
  } catch (err) {
    console.error('❌ Firestore removeBookmark FAILED:', err.code, err.message);
    throw err;
  }
}

/**
 * Get all bookmarks from Firestore.
 */
export async function getBookmarks() {
  const uid = getUid();
  if (!uid) return [];

  try {
    const snap = await getDocs(collection(db, `users/${uid}/bookmarks`));
    const bookmarks = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    console.log(`📖 Loaded ${bookmarks.length} bookmarks from Firestore`);
    return bookmarks;
  } catch (err) {
    console.error('❌ Firestore getBookmarks FAILED:', err.code, err.message);
    return [];
  }
}

// ==================================
// History (Activity Log)
// ==================================

/**
 * Save a history entry to Firestore.
 */
export async function saveHistory(entry) {
  const uid = getUid();
  if (!uid) {
    console.warn('⚠️ saveHistory skipped: no user logged in');
    return;
  }

  const historyEntry = {
    ...entry,
    timestamp: entry.timestamp || new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, `users/${uid}/history`, entry.id), historyEntry);
    console.log('✅ History saved to Firestore:', entry.id, entry.type, entry.topic);
  } catch (err) {
    console.error('❌ Firestore saveHistory FAILED:', err.code, err.message);
    throw err;
  }
}

/**
 * Get history entries from Firestore.
 */
export async function getHistory() {
  const uid = getUid();
  if (!uid) return [];

  try {
    const snap = await getDocs(collection(db, `users/${uid}/history`));
    const history = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    // Sort client-side (avoids needing Firestore composite index)
    history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    console.log(`📖 Loaded ${history.length} history entries from Firestore`);
    return history;
  } catch (err) {
    console.error('❌ Firestore getHistory FAILED:', err.code, err.message);
    return [];
  }
}

// ==================================
// Quiz Attempts
// ==================================

/**
 * Save a quiz attempt to Firestore.
 */
export async function saveQuizAttempt(attempt) {
  const uid = getUid();
  if (!uid) return;

  const attemptData = {
    ...attempt,
    quizDate: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, `users/${uid}/quizAttempts`, attempt.id), attemptData);
    console.log('✅ Quiz attempt saved to Firestore:', attempt.id);
  } catch (err) {
    console.error('❌ Firestore saveQuizAttempt FAILED:', err.code, err.message);
    throw err;
  }
}

/**
 * Get quiz attempts from Firestore.
 */
export async function getQuizAttempts() {
  const uid = getUid();
  if (!uid) return [];

  try {
    const snap = await getDocs(collection(db, `users/${uid}/quizAttempts`));
    const attempts = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    attempts.sort((a, b) => new Date(b.quizDate) - new Date(a.quizDate));
    console.log(`📖 Loaded ${attempts.length} quiz attempts from Firestore`);
    return attempts;
  } catch (err) {
    console.error('❌ Firestore getQuizAttempts FAILED:', err.code, err.message);
    return [];
  }
}

// ==================================
// Progress Tracker
// ==================================

/**
 * Save/update progress stats in Firestore (merge).
 */
export async function saveProgress(progress) {
  const uid = getUid();
  if (!uid) return;

  const progressData = {
    ...progress,
    updatedOn: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, `users/${uid}/progress`, 'stats'), progressData, { merge: true });
    console.log('✅ Progress saved to Firestore');
  } catch (err) {
    console.error('❌ Firestore saveProgress FAILED:', err.code, err.message);
    throw err;
  }
}

/**
 * Get progress stats from Firestore.
 */
export async function getProgress() {
  const uid = getUid();
  if (!uid) return { topicsStudied: 0, quizzesCompleted: 0, streak: 0, totalStudyTime: 0 };

  try {
    const snap = await getDoc(doc(db, `users/${uid}/progress`, 'stats'));
    if (snap.exists()) {
      console.log('📖 Loaded progress from Firestore');
      return snap.data();
    }
    console.log('📖 No progress doc yet in Firestore (new user)');
    return { topicsStudied: 0, quizzesCompleted: 0, streak: 0, totalStudyTime: 0 };
  } catch (err) {
    console.error('❌ Firestore getProgress FAILED:', err.code, err.message);
    return { topicsStudied: 0, quizzesCompleted: 0, streak: 0, totalStudyTime: 0 };
  }
}
