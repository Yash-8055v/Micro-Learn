import React, { useState, useRef, useEffect } from 'react';
import useLocalStorage from '../utils/useLocalStorage';
import { auth } from '../firebase';
import ChatMessage from '../components/ChatMessage';
import { answerDoubt } from '../services/llmService';
import { saveHistory } from '../services/firestoreService';
import './DoubtHelper.css';

function DoubtHelper() {
  /*
   * Persisted state — chat history survives navigation (localStorage).
   * Keys are scoped by userId so each account has isolated data.
   */
  const userId = auth.currentUser?.uid;
  const [messages, setMessages] = useLocalStorage('sparklearn_doubt_messages', userId, [
    { text: "Hi! I'm your AI study buddy 🤖\n\nAsk me any doubt about your studies — I'll explain it in a simple, student-friendly way.\n\nYou can also set a topic context below for more relevant answers!", isUser: false },
  ]);
  const [input, setInput] = useState('');
  const [topicContext, setTopicContext] = useLocalStorage('sparklearn_doubt_context', userId, '');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  /* Auto-scroll to bottom when new messages arrive */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { text: userMessage, isUser: true }]);
    setLoading(true);

    try {
      const response = await answerDoubt(userMessage, topicContext, messages);
      setMessages((prev) => [...prev, { text: response, isUser: false }]);

      // Save to history
      await saveHistory({
        id: Date.now().toString(),
        topic: topicContext || 'General',
        type: 'doubt',
        difficulty: 'intermediate',
      });
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { text: 'Oops! Something went wrong. Please try again. 😅', isUser: false },
      ]);
    }
    setLoading(false);
    inputRef.current?.focus();
  };

  const handleClearChat = () => {
    setMessages([
      { text: "Chat cleared! Ask me anything 🤖", isUser: false },
    ]);
  };

  return (
    <div className="doubt-helper animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">💬 Ask a Doubt</h1>
        <p className="page-subtitle">Your AI study buddy is here to help</p>
      </div>

      {/* Topic Context */}
      <div className="doubt-context">
        <label className="context-label">Topic Context (optional)</label>
        <div className="context-row">
          <input
            type="text"
            className="input context-input"
            placeholder="e.g., Data Structures, Physics, Calculus..."
            value={topicContext}
            onChange={(e) => setTopicContext(e.target.value)}
          />
          <button className="btn btn-ghost" onClick={handleClearChat}>
            🗑️ Clear Chat
          </button>
        </div>
      </div>

      {/* Chat Window */}
      <div className="chat-window card-flat">
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <ChatMessage key={i} message={msg.text} isUser={msg.isUser} />
          ))}
          {loading && (
            <div className="chat-typing animate-fade-in">
              <div className="chat-avatar ai-avatar">🤖</div>
              <div className="typing-indicator">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="chat-input-form">
          <input
            ref={inputRef}
            type="text"
            className="input chat-input"
            placeholder="Type your doubt here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="btn btn-primary chat-send-btn"
            disabled={loading || !input.trim()}
          >
            {loading ? '...' : '➤'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default DoubtHelper;
