/**
 * ============================================
 * LLM Service — SparkLearn (Gemini 3 via @google/genai SDK)
 * ============================================
 *
 * Uses the official @google/genai SDK with Gemini 3 Flash Preview.
 * Auto-retries on 429 rate limit errors.
 * API key loaded from .env: VITE_LLM_API_KEY
 */

import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = import.meta.env.VITE_LLM_API_KEY;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const MODEL = "gemini-3-flash-preview";

/**
 * Helper: wait for given milliseconds.
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Helper: call Gemini API with retry on 429 rate limit errors.
 * Retries up to 3 times with exponential backoff (2s, 4s, 8s).
 */
async function callGemini(prompt, maxTokens = 2048) {
  if (!GEMINI_API_KEY) {
    throw new Error('VITE_LLM_API_KEY is not set in .env file');
  }

  const MAX_RETRIES = 3;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
          temperature: 0.7,
          maxOutputTokens: maxTokens,
        },
      });

      return response.text;
    } catch (err) {
      // Handle 429 rate limit — retry with backoff
      if (err?.status === 429 || err?.message?.includes('429')) {
        if (attempt < MAX_RETRIES) {
          const waitTime = Math.pow(2, attempt + 1) * 1000; // 2s, 4s, 8s
          console.warn(`⏳ Rate limited (429). Retrying in ${waitTime / 1000}s... (attempt ${attempt + 1}/${MAX_RETRIES})`);
          await delay(waitTime);
          continue;
        }
        throw new Error('Rate limit exceeded (429). The free Gemini API has a limit of ~15 requests/minute. Please wait a moment and try again.');
      }

      if (attempt === MAX_RETRIES) {
        throw err;
      }

      // For other errors, throw immediately
      console.error('Gemini API error:', err);
      throw new Error(`API error: ${err.message?.slice(0, 200)}`);
    }
  }
}

/**
 * Helper: parse JSON from Gemini response (strips markdown fences if present).
 */
function parseJSON(raw) {
  // Gemini sometimes wraps JSON in ```json ... ```
  const cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  return JSON.parse(cleaned);
}

/**
 * Get a student-friendly explanation of a topic.
 */
export async function getTopicExplanation(topic, difficulty = 'beginner') {
  const prompt = `You are a friendly, encouraging college tutor. Explain "${topic}" at the ${difficulty} level for a college student.

Return your response as JSON with this exact structure (no markdown fences):
{
  "explanation": "A clear, multi-paragraph explanation. Use **bold** for key terms. Include bullet points with • character for key points.",
  "example": "A relatable real-world analogy or example that a college student would understand.",
  "microTask": "A specific, actionable 10-minute study task the student can do right now to reinforce this topic. Start with an emoji."
}
Only return valid JSON.`;

  try {
    const raw = await callGemini(prompt);
    const parsed = parseJSON(raw);
    return { topic, difficulty, ...parsed };
  } catch (err) {
    console.error('getTopicExplanation error:', err);
    return {
      topic,
      difficulty,
      explanation: `⚠️ **AI Error:** ${err.message}\n\nPlease check:\n• Your Gemini API key is correct in the .env file\n• The Generative Language API is enabled in your Google Cloud Console\n• Open browser DevTools (F12 → Console) for more details`,
      example: 'Unable to generate — see error above.',
      microTask: '📝 Check the browser console (F12) for detailed error logs.',
    };
  }
}

/**
 * Get concise revision notes for a topic.
 */
export async function getRevisionNotes(topic, difficulty = 'beginner') {
  const prompt = `Create concise revision notes for "${topic}" at the ${difficulty} level for a college student.

Return JSON (no markdown fences):
{
  "notes": [
    { "heading": "Definition", "content": "..." },
    { "heading": "Key Concepts", "content": "Use • for bullet points" },
    { "heading": "Important Formulas / Rules", "content": "..." },
    { "heading": "Common Mistakes", "content": "..." },
    { "heading": "Quick Tips", "content": "..." }
  ],
  "summary": "A one-line summary encouraging the student."
}
Only return valid JSON.`;

  try {
    const raw = await callGemini(prompt);
    const parsed = parseJSON(raw);
    return { topic, difficulty, ...parsed };
  } catch (err) {
    console.error('getRevisionNotes error:', err);
    return {
      topic,
      difficulty,
      notes: [{ heading: 'Error', content: 'Could not generate revision notes. Please try again.' }],
      summary: 'Please try again in a moment.',
    };
  }
}

/**
 * Generate MCQ practice questions.
 */
export async function generateQuestions(topic, difficulty = 'beginner', count = 5) {
  const prompt = `Generate exactly ${count} multiple choice questions about "${topic}" at the ${difficulty} level for a college student.

Return JSON (no markdown fences):
{
  "mcqs": [
    {
      "id": 1,
      "question": "The question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Why this answer is correct"
    }
  ]
}
"correct" is the 0-based index of the right option (0, 1, 2, or 3).
Make questions progressively harder. Only return valid JSON.`;

  try {
    const raw = await callGemini(prompt);
    const parsed = parseJSON(raw);
    return { topic, difficulty, ...parsed };
  } catch (err) {
    console.error('generateQuestions error:', err);
    return {
      topic,
      difficulty,
      mcqs: [{
        id: 1,
        question: `Could not generate questions for "${topic}". Please try again.`,
        options: ['Try again', 'Refresh', 'Change topic', 'Check connection'],
        correct: 0,
        explanation: 'There was an API error. Please try again.',
      }],
    };
  }
}

/**
 * Answer a student doubt (chat-style).
 */
export async function answerDoubt(question, topic = '', history = []) {
  const context = topic ? `The student is currently studying "${topic}". ` : '';

  // Build conversation context from last few messages
  let conversationContext = '';
  if (history.length > 1) {
    const recent = history.slice(-6); // last 6 messages for context
    conversationContext = '\n\nPrevious conversation:\n' +
      recent.map((m) => `${m.isUser ? 'Student' : 'Tutor'}: ${m.text}`).join('\n') + '\n\n';
  }

  const prompt = `You are a friendly, encouraging AI tutor for college students. ${context}${conversationContext}The student asks: "${question}"

Respond helpfully and clearly:
- Use **bold** for key terms
- Keep the response concise but thorough
- Use bullet points when listing things
- Be encouraging and supportive
- Use 1-2 relevant emojis
- If the question is vague, ask a clarifying follow-up question`;

  try {
    return await callGemini(prompt);
  } catch (err) {
    console.error('answerDoubt error:', err);
    return 'Oops! I had trouble processing that. Could you try rephrasing your question? 😅';
  }
}

/**
 * Generate a 7-day weekly study plan.
 */
export async function generateWeeklyPlan(subjects = [], difficulty = 'beginner') {
  const subjectList = subjects.join(', ');
  const prompt = `Create a detailed 7-day study plan for a college student studying: ${subjectList}.

Return JSON (no markdown fences):
{
  "subjects": [${subjects.map(s => `"${s}"`).join(', ')}],
  "plan": [
    {
      "day": "Monday",
      "tasks": [
        { "time": "9:00 AM", "task": "Study task description", "duration": "60 min", "type": "study" }
      ]
    }
  ],
  "tips": ["tip1", "tip2", "tip3", "tip4"]
}

Rules:
- Include all 7 days (Monday through Sunday)
- type must be one of: "study", "practice", "revision", "review", "break"
- Sunday should be a lighter revision day
- Include breaks
- Each day should have 4-6 tasks
- Tips should be practical and motivational with emojis
Only return valid JSON.`;

  try {
    const raw = await callGemini(prompt, 8192);
    console.log('Weekly plan raw response length:', raw?.length);
    const parsed = parseJSON(raw);
    console.log('Weekly plan parsed keys:', Object.keys(parsed));
    return { ...parsed, difficulty };
  } catch (err) {
    console.error('generateWeeklyPlan error:', err);
    return {
      subjects,
      difficulty,
      plan: [{ day: 'Error', tasks: [{ time: '', task: 'Could not generate plan. Please try again.', duration: '', type: 'study' }] }],
      tips: ['Please try again in a moment.'],
    };
  }
}
