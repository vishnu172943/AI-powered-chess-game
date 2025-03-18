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
        setMessage('Game is over!');
        return;
      }

      // Log current game state for debugging
      console.log('Current Game State:', {
        fen: chess.fen(),
        turn: chess.turn(),
        validMoves: chess.moves({ verbose: true }),
        moveHistory: moves
      });

      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts) {
        try {
          const aiMove = await getAIMove(chess.fen(), moves, lastInvalidMove);
          console.log('AI suggested move:', aiMove);
          
          // Verify move is valid
          const validMoves = chess.moves({ verbose: true });
          const isValidMove = validMoves.some(
            move => move.from === aiMove.from && move.to === aiMove.to
          );

          if (!isValidMove) {
            console.warn('Invalid move suggested:', aiMove);
            throw new Error('Invalid move');
          }

          // Make the move
          const moveResult = await handleMove(aiMove.from, aiMove.to);
          if (moveResult) {
            console.log('Move successful:', moveResult);
            setLastInvalidMove(null);
            return;
          }
          
          setLastInvalidMove(aiMove);
          attempts++;
        } catch (moveError) {
          console.warn(`Move attempt ${attempts + 1} failed:`, moveError);
          attempts++;
        }
      }

      throw new Error('Failed to make a valid move');
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
