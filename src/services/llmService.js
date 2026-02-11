import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = import.meta.env.VITE_LLM_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
const MODEL = "gemini-3-flash-preview";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGemini(prompt, maxTokens = 2048) {
  if (!GEMINI_API_KEY) {
    throw new Error('API key is not configured');
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
      if (err?.status === 429 || err?.message?.includes('429')) {
        if (attempt < MAX_RETRIES) {
          const waitTime = Math.pow(2, attempt + 1) * 1000;
          await delay(waitTime);
          continue;
        }
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      }

      if (attempt === MAX_RETRIES) throw err;
      throw new Error(`API error: ${err.message?.slice(0, 200)}`);
    }
  }
}

function parseJSON(raw) {
  const cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  return JSON.parse(cleaned);
}

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
    return {
      topic,
      difficulty,
      explanation: `Could not generate explanation. Please try again.\n\nError: ${err.message}`,
      example: 'Unable to generate.',
      microTask: 'Please try again in a moment.',
    };
  }
}

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
  } catch {
    return {
      topic,
      difficulty,
      notes: [{ heading: 'Error', content: 'Could not generate revision notes. Please try again.' }],
      summary: 'Please try again in a moment.',
    };
  }
}

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
  } catch {
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

export async function answerDoubt(question, topic = '', history = []) {
  const context = topic ? `The student is currently studying "${topic}". ` : '';

  let conversationContext = '';
  if (history.length > 1) {
    const recent = history.slice(-6);
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
  } catch {
    return 'Something went wrong. Could you try rephrasing your question?';
  }
}

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
    const parsed = parseJSON(raw);
    return { ...parsed, difficulty };
  } catch {
    return {
      subjects,
      difficulty,
      plan: [{ day: 'Error', tasks: [{ time: '', task: 'Could not generate plan. Please try again.', duration: '', type: 'study' }] }],
      tips: ['Please try again in a moment.'],
    };
  }
}
