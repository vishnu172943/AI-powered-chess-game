import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getDeepSeekResponse } from '../services/chessCoach';

const DeepSeekChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const chatRef = useRef(null);

  // Enhanced scroll handler
  const scrollToBottom = useCallback(() => {
    if (chatRef.current) {
      const { scrollHeight, clientHeight } = chatRef.current;
      chatRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  // Auto-scroll when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Enhanced message adding with guaranteed scroll
  const addMessage = async (content, isUser = false) => {
    try {
      const newMessage = {
        id: Date.now(),
        content: content,
        isUser,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, newMessage]);

      // Ensure scroll happens after message is rendered
      requestAnimationFrame(() => {
        requestAnimationFrame(scrollToBottom);
      });
    } catch (error) {
      console.error('Error adding message:', error);
    }
  };

  const renderThinkingMessage = () => (
    <div className="chat-message ai thinking-message">
      <span className="ai-avatar">🤔</span>
      <div className="message-content thinking">
        <span className="thinking-dots">Thinking</span>
        <span className="dots">...</span>
      </div>
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    addMessage(userMessage, true);
    setInput('');
    setIsThinking(true);

    try {
      const response = await getDeepSeekResponse(userMessage);
      if (response) {
        await addMessage(response.trim(), false);
      }
    } catch (error) {
      console.error('DeepSeek error:', error);
      await addMessage("I apologize, I'm having trouble processing that request. 🤔", false);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="deepseek-chat">
      <div className="chat-header">
        <div className="chat-title">
          <span className="ai-avatar">🤖</span>
          <h3>DeepSeek v3</h3>
        </div>
      </div>

      <div className="chat-messages" ref={chatRef}>
        {messages.length === 0 ? (
          <div className="chat-placeholder">
            Hello! I'm DeepSeek v3. How can I assist you today? 🤖
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={`chat-message ${msg.isUser ? 'user' : 'ai'}`}>
              {!msg.isUser && <span className="ai-avatar">🤖</span>}
              <div className="message-content">
                {msg.content}
              </div>
            </div>
          ))
        )}
        
        {isThinking && renderThinkingMessage()}
      </div>

      <form onSubmit={handleSubmit} className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          disabled={isThinking}
        />
        <button type="submit" disabled={isThinking || !input.trim()}>
          {isThinking ? '⏳' : '📤'}
        </button>
      </form>
    </div>
  );
};

export default DeepSeekChat;