import React, { useState, useContext, useRef, useEffect, useCallback } from 'react';
import { ChessContext } from '../context/ChessContext';
import { getChessAdvice } from '../services/chessCoach';

const ChessCoach = () => {
  const { chess, moves } = useContext(ChessContext);
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
    <div className="chat-message coach thinking-message">
      <span className="coach-avatar">🤔</span>
      <div className="message-content thinking">
        <span className="thinking-dots">Thinking</span>
        <span className="dots">...</span>
      </div>
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userQuestion = input.trim();
    addMessage(userQuestion, true);
    setInput('');
    setIsThinking(true);

    try {
      // Detect if question is about chess position or general chess topic
      const isPositionQuestion = userQuestion.toLowerCase().includes('move') ||
        userQuestion.toLowerCase().includes('position') ||
        userQuestion.toLowerCase().includes('piece') ||
        userQuestion.toLowerCase().includes('attack') ||
        userQuestion.toLowerCase().includes('defend') ||
        userQuestion.toLowerCase().includes('check');

      const response = await Promise.race([
        getChessAdvice(
          chess.fen(),
          moves,
          chess.turn(),
          userQuestion,
          isPositionQuestion ? chess.board() : null  // Pass board state only for position questions
        ),
        new Promise((_, reject) => setTimeout(() => reject('Timeout'), 8000))
      ]);

      await addMessage(response.trim(), false);
    } catch (error) {
      console.error('Chess coach error:', error);
      await addMessage("Let me think about that differently... 🤔", false);
    } finally {
      setIsThinking(false);
    }
  };

  // Add effect to reset coach state when game resets
  useEffect(() => {
    // Reset all coach state when chess game resets
    if (chess.fen() === 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1') {
      setMessages([]);
      setInput('');
      setIsThinking(false);
      // Add welcome message
      addMessage("Hi! Game restarted. I'm ready to help with your moves! 🎯", false);
    }
  }, [chess.fen()]);

  return (
    <div className="chess-coach">
      <div className="coach-header">
        <div className="coach-title">
          <span className="coach-avatar">🧙‍♂️</span>
          <h3>Chess Coach</h3>
        </div>
      </div>

      <div className="coach-chat" ref={chatRef}>
        {messages.length === 0 ? (
          <div className="chat-placeholder">
            Hi! I'm your chess coach! Ask me about the game, current position, or any chess topic! 🎯
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={`chat-message ${msg.isUser ? 'user' : 'coach'}`}>
              {!msg.isUser && <span className="coach-avatar">🧙‍♂️</span>}
              <div className="message-content">
                {msg.content}
              </div>
            </div>
          ))
        )}
        
        {isThinking && renderThinkingMessage()}
      </div>

      <form onSubmit={handleSubmit} className="coach-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about the position or any chess topic..."
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
