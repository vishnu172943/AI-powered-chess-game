import React, { useState, useContext, useRef, useEffect } from 'react';
import { ChessContext } from '../context/ChessContext';
import { getChessAdvice } from '../services/chessCoach';

const ChessCoach = () => {
  const { chess, moves } = useContext(ChessContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const chatRef = useRef(null);

  const addMessage = (content, isUser = false) => {
    const newMessage = {
      id: Date.now(),
      content,
      isUser,
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userQuestion = input.trim();
    addMessage(userQuestion, true);
    setInput('');
    setIsThinking(true);

    try {
      const response = await getChessAdvice(
        chess.fen(),
        moves,
        chess.turn(),
        userQuestion
      );
      addMessage(response);
    } catch (error) {
      addMessage("I apologize, I need a moment to think about this position.");
    } finally {
      setIsThinking(false);
    }
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="chess-coach">
      <div className="coach-header">
        <span className="coach-avatar">🧙‍♂️</span>
        <h3>Your Chess Buddy</h3>
      </div>
      <div className="coach-chat" ref={chatRef}>
        {messages.length === 0 ? (
          <div className="chat-placeholder">
            Type a message to start chatting with your chess coach!
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={`chat-message ${msg.isUser ? 'user' : 'coach'}`}>
              {!msg.isUser && <span className="coach-avatar-small">👨‍🏫</span>}
              <div className="message-content">
                <p>{msg.content}</p>
                <span className="timestamp">{msg.timestamp}</span>
              </div>
            </div>
          ))
        )}
        {isThinking && (
          <div className="thinking-indicator">
            <span className="thinking-star">⭐</span>
            Analyzing...
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="coach-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask coach for advice..."
          disabled={isThinking}
        />
        <button type="submit" disabled={isThinking || !input.trim()}>
          {isThinking ? '💭' : '📨'}
        </button>
      </form>
    </div>
  );
};

export default ChessCoach;
