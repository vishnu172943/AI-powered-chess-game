import React, { useContext, useState } from 'react';
import { ChessContext } from '../context/ChessContext';
import { getChessAdvice } from '../services/chessCoach';
import { useGame } from '../context/GameContext';

const HintBox = () => {
  const { chess, moves, message, setMessage, resetGame } = useContext(ChessContext);
  const { userColor } = useGame();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const getAdvice = async () => {
    setIsAnalyzing(true);
    try {
      const advice = await getChessAdvice(
        chess.fen(),
        moves,
        userColor || 'white'
      );
      setMessage(advice);
    } catch (error) {
      setMessage("I need a moment to think about this position...");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNewGame = () => {
    resetGame();
    setMessage("Hello! I'm your chess coach. Ready for a new game?");
  };

  return (
    <div className="hint-box">
      <button onClick={handleNewGame}>New Game</button>
      <button 
        onClick={getAdvice}
        disabled={isAnalyzing}
        className={isAnalyzing ? 'analyzing' : ''}
      >
        {isAnalyzing ? (
          <>
            <span className="thinking-star">⭐</span>
            Analyzing...
          </>
        ) : (
          'Ask Chess Coach'
        )}
      </button>
      <div className="message-box">
        <div className="coach-avatar">👨‍🏫</div>
        <div className="message">
          {message || "Hello! I'm your chess coach. Need advice on your next move?"}
        </div>
      </div>
    </div>
  );
};

export default HintBox;
