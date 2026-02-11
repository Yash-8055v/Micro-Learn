import React from 'react';
import './ChatMessage.css';

function ChatMessage({ message, isUser }) {
  return (
    <div className={`chat-message ${isUser ? 'user' : 'ai'} animate-fade-in`}>
      {!isUser && (
        <div className="chat-avatar ai-avatar">🤖</div>
      )}
      <div className={`chat-bubble ${isUser ? 'user-bubble' : 'ai-bubble'}`}>
        <div className="chat-text" dangerouslySetInnerHTML={{ __html: formatMessage(message) }} />
        <span className="chat-time">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      {isUser && (
        <div className="chat-avatar user-avatar">👤</div>
      )}
    </div>
  );
}

/* Simple markdown-like formatting */
function formatMessage(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />');
}

export default ChatMessage;
