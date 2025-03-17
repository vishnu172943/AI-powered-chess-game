import React, { useContext, useEffect, useState, useCallback } from 'react';
import { ChessContext } from '../context/ChessContext';
import { getAIMove } from '../services/aiService';

const AIGame = () => {
  const { chess, moves, handleMove, setMessage } = useContext(ChessContext);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [lastInvalidMove, setLastInvalidMove] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const makeAIMove = useCallback(async () => {
    setIsAIThinking(true);
    setAiError(null);
    
    try {
      if (retryCount >= 3) {
        throw new Error('AI failed to make a valid move after multiple attempts');
      }

      const aiMove = await getAIMove(chess.fen(), moves, lastInvalidMove);
      console.log('AI attempting move:', aiMove);
      
      const result = await handleMove(aiMove.from, aiMove.to);
      if (!result) {
        setLastInvalidMove(aiMove);
        setRetryCount(prev => prev + 1);
        // Retry with the invalid move information
        return makeAIMove();
      }
      
      // Reset counters on successful move
      setRetryCount(0);
      setLastInvalidMove(null);
      setMessage('AI moved: ' + aiMove.from + ' to ' + aiMove.to);
    } catch (error) {
      console.error('AI move error:', error);
      setAiError(error.message);
      setMessage('AI error: ' + error.message);
      setAiEnabled(false);
    } finally {
      setIsAIThinking(false);
    }
  }, [chess, moves, handleMove, setMessage, lastInvalidMove, retryCount]);

  useEffect(() => {
    if (aiEnabled && chess.turn() === 'b' && !chess.isGameOver()) {
      makeAIMove();
    }
  }, [chess.fen(), aiEnabled, makeAIMove]);

  const toggleAI = () => {
    if (!aiEnabled && chess.turn() === 'b') {
      setMessage("AI will play as Black");
    }
    setAiEnabled(!aiEnabled);
    setAiError(null);
  };

  return (
    <div className="ai-controls">
      <button 
        onClick={toggleAI}
        className={`ai-toggle ${aiEnabled ? 'active' : ''}`}
        disabled={isAIThinking}
      >
        {isAIThinking ? '🤖 Processing...' : (aiEnabled ? '🤖 Disable AI' : '🤖 Play vs AI')}
      </button>
      {isAIThinking && (
        <div className="ai-thinking-container">
          <div className="thinking-star">⭐</div>
        </div>
      )}
      {aiError && (
        <div className="ai-error">
          {aiError}
          <button 
            className="retry-btn" 
            onClick={() => {
              setAiError(null);
              setRetryCount(0);
              setAiEnabled(true);
            }}
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
};

export default AIGame;
