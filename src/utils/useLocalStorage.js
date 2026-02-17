import { useState, useEffect } from 'react';

/**
 * useLocalStorage — Custom hook that syncs React state with localStorage.
 *
 * @param {string}  key          – Unique localStorage key for this piece of state.
 * @param {*}       initialValue – Fallback value when nothing is stored yet.
 * @returns {[*, Function]}      – Same API as useState: [value, setValue].
 *
 * Persistence flow:
 *   1. On mount → reads localStorage[key], falls back to initialValue.
 *   2. On every update → writes the new value to localStorage[key].
 *   3. Values are JSON-serialised, so objects and arrays work out of the box.
 */
export default function useLocalStorage(key, initialValue) {
  /* ---- Lazy initialiser: read from localStorage once on mount ---- */
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  /* ---- Sync to localStorage whenever value changes ---- */
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage full or unavailable — fail silently
    }
  }, [key, value]);

  return [value, setValue];
}
