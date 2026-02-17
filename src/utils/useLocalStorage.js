import { useState, useEffect } from 'react';
import { getUserKey } from './storageUtils';

/**
 * useLocalStorage — Custom hook that syncs React state with localStorage.
 *
 * USER-SCOPED PERSISTENCE:
 *   When a userId is provided the actual localStorage key becomes
 *   "sparklearn_<userId>_<baseKey>", ensuring that each authenticated
 *   user has a completely isolated data namespace.  This prevents
 *   data leakage when multiple accounts share the same browser.
 *
 *   When userId is omitted (e.g. theme preference) the raw key is
 *   used so the value remains accessible before authentication.
 *
 * @param {string}       key          – Logical localStorage key (e.g. "sparklearn_learn_topic").
 * @param {string|null}  userId       – Firebase UID for per-user scoping (null = global key).
 * @param {*}            initialValue – Fallback value when nothing is stored yet.
 * @returns {[*, Function]}           – Same API as useState: [value, setValue].
 */
export default function useLocalStorage(key, userId, initialValue) {
  /*
   * Resolve the actual storage key:
   *   • With userId  → "sparklearn_<uid>_learn_topic"  (user-isolated)
   *   • Without      → raw key as-is                    (global / pre-auth)
   */
  const storageKey = userId ? getUserKey(userId, key) : key;

  /* ---- Lazy initialiser: read from localStorage once on mount ---- */
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored !== null ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  /* ---- Sync to localStorage whenever value changes ---- */
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      // Storage full or unavailable — fail silently
    }
  }, [storageKey, value]);

  return [value, setValue];
}
