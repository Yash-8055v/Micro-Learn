/**
 * storageUtils.js — Helpers for per-user localStorage isolation.
 *
 * WHY USER-SCOPED KEYS?
 *   localStorage is shared across all users on the same browser + origin.
 *   Without scoping, User B sees User A's cached topics, quiz answers, etc.
 *   By embedding the authenticated user's UID into every key, each user's
 *   data lives in its own namespace and can never leak to another account.
 *
 * KEY FORMAT:  sparklearn_<userId>_<baseKey>
 *   e.g. sparklearn_abc123_learn_topic
 */

/** Prefix used by all app keys */
const APP_PREFIX = 'sparklearn_';

/**
 * Build a user-scoped localStorage key.
 *
 * Strips any existing "sparklearn_" prefix from baseKey to avoid
 * double-prefixing (callers may pass either "learn_topic" or
 * "sparklearn_learn_topic").
 *
 * @param {string} userId  – Firebase auth UID
 * @param {string} baseKey – logical key name (e.g. "learn_topic")
 * @returns {string} scoped key like "sparklearn_abc123_learn_topic"
 */
export function getUserKey(userId, baseKey) {
  const stripped = baseKey.startsWith(APP_PREFIX)
    ? baseKey.slice(APP_PREFIX.length)
    : baseKey;
  return `${APP_PREFIX}${userId}_${stripped}`;
}

/**
 * Remove all localStorage entries belonging to a specific user.
 *
 * Called on logout so the next person who signs in on this device
 * never encounters stale data from a different account.
 *
 * HOW IT WORKS:
 *   Iterates every localStorage key and deletes those matching
 *   the pattern "sparklearn_<userId>_*".
 *
 * @param {string} userId – Firebase auth UID of the user logging out
 */
export function clearUserStorage(userId) {
  const prefix = `${APP_PREFIX}${userId}_`;
  const keysToRemove = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => localStorage.removeItem(key));
}
