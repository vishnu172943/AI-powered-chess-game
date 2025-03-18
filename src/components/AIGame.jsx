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
      if (chess.isGameOver()) {
        setAiEnabled(false);
        return;
      }

      const validMoves = chess.moves({ verbose: true });
      const attempts = { count: 0, maxTries: 3 };

      while (attempts.count < attempts.maxTries) {
        try {
          const aiMove = await getAIMove(
            chess.fen(),
            moves,
            attempts.count > 0 ? lastInvalidMove : null
          );

          if (validMoves.some(move => 
            move.from === aiMove.from && move.to === aiMove.to
          )) {
            const result = await handleMove(aiMove.from, aiMove.to);
            if (result) {
              setLastInvalidMove(null);
              return;
            }
          }
          
          attempts.count++;
          setLastInvalidMove({
            move: aiMove,
            error: 'Invalid move, retrying with feedback',
            attempt: attempts.count
          });
          
        } catch (moveError) {
          attempts.count++;
          console.error(`AI move attempt ${attempts.count} failed:`, moveError);
        }
      }

      throw new Error('Failed to make a valid move after multiple attempts');
    } catch (error) {
      console.error('AI move error:', error);
      setAiError(error.message);
      setAiEnabled(false);
    } finally {
      setIsAIThinking(false);
    }
  }, [chess, moves, handleMove, lastInvalidMove]);

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
