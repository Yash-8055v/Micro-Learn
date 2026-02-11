/**
 * ============================================
 * Difficulty Adjustment Logic — SparkLearn
 * ============================================
 *
 * Adjusts the difficulty level based on quiz performance.
 * This is a UI-only feature — the logic can later be
 * enhanced with AI-based adaptive learning.
 */

/**
 * Adjusts difficulty based on quiz score percentage.
 *
 * Rules:
 * - Score >= 80%  → move up one level
 * - Score <= 40%  → move down one level
 * - Otherwise     → stay at current level
 *
 * @param {number} score - Score percentage (0-100)
 * @param {string} currentLevel - 'beginner' | 'intermediate' | 'advanced'
 * @returns {{ newLevel: string, message: string, changed: boolean }}
 */
export function adjustDifficulty(score, currentLevel) {
  const levels = ['beginner', 'intermediate', 'advanced'];
  const currentIndex = levels.indexOf(currentLevel);

  if (score >= 80 && currentIndex < levels.length - 1) {
    const newLevel = levels[currentIndex + 1];
    return {
      newLevel,
      message: `🎉 Great job! You scored ${score}%. Moving up to ${newLevel} level!`,
      changed: true,
    };
  }

  if (score <= 40 && currentIndex > 0) {
    const newLevel = levels[currentIndex - 1];
    return {
      newLevel,
      message: `No worries! Let's strengthen your basics. Adjusting to ${newLevel} level.`,
      changed: true,
    };
  }

  return {
    newLevel: currentLevel,
    message: `Good effort! You scored ${score}%. Keep practicing at the ${currentLevel} level.`,
    changed: false,
  };
}

/**
 * Returns a color class for score display.
 * @param {number} score
 * @returns {string}
 */
export function getScoreColor(score) {
  if (score >= 80) return 'success';
  if (score >= 50) return 'warning';
  return 'error';
}

/**
 * Returns emoji based on score.
 * @param {number} score
 * @returns {string}
 */
export function getScoreEmoji(score) {
  if (score >= 90) return '🏆';
  if (score >= 80) return '🌟';
  if (score >= 60) return '👍';
  if (score >= 40) return '💪';
  return '📚';
}
