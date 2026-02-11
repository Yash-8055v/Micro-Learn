/**
 * ============================================
 * Mock Data — SparkLearn
 * ============================================
 *
 * Sample data for UI development and demo.
 * Replace with real data from Firestore once integrated.
 */

export const sampleTopics = [
  { id: '1', name: 'Data Structures', category: 'Computer Science', icon: '🏗️' },
  { id: '2', name: 'Organic Chemistry', category: 'Chemistry', icon: '⚗️' },
  { id: '3', name: 'Linear Algebra', category: 'Mathematics', icon: '📐' },
  { id: '4', name: 'Microeconomics', category: 'Economics', icon: '📊' },
  { id: '5', name: 'Cell Biology', category: 'Biology', icon: '🧬' },
  { id: '6', name: 'Digital Electronics', category: 'Electronics', icon: '💡' },
  { id: '7', name: 'Machine Learning', category: 'Computer Science', icon: '🤖' },
  { id: '8', name: 'Thermodynamics', category: 'Physics', icon: '🔥' },
];

export const sampleHistory = [
  { id: '1', topic: 'Data Structures', type: 'learning', difficulty: 'intermediate', timestamp: '2026-02-10T14:30:00Z', score: null },
  { id: '2', topic: 'Linear Algebra', type: 'quiz', difficulty: 'beginner', timestamp: '2026-02-10T11:00:00Z', score: 85 },
  { id: '3', topic: 'Organic Chemistry', type: 'revision', difficulty: 'beginner', timestamp: '2026-02-09T16:00:00Z', score: null },
  { id: '4', topic: 'Machine Learning', type: 'learning', difficulty: 'advanced', timestamp: '2026-02-09T10:00:00Z', score: null },
  { id: '5', topic: 'Microeconomics', type: 'quiz', difficulty: 'intermediate', timestamp: '2026-02-08T15:30:00Z', score: 72 },
  { id: '6', topic: 'Cell Biology', type: 'doubt', difficulty: 'beginner', timestamp: '2026-02-08T09:00:00Z', score: null },
];

export const sampleStats = {
  topicsStudied: 24,
  quizzesCompleted: 12,
  streak: 7,
  totalStudyTime: 1860, // minutes
  averageScore: 78,
  weeklyGoal: 70, // percentage complete
};

export const motivationalQuotes = [
  { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
  { text: "Learning is not attained by chance, it must be sought for with ardor.", author: "Abigail Adams" },
  { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
  { text: "Education is the passport to the future.", author: "Malcolm X" },
  { text: "Study hard, for the well is deep, and our brains are shallow.", author: "Richard Baxter" },
  { text: "The more that you read, the more things you will know.", author: "Dr. Seuss" },
];
