import React, { useContext, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase/firebase';
import ChessBoard from './ChessBoard';
import MoveHistory from './MoveHistory';
import HintBox from './HintBox';
import GameSetup from './GameSetup';
import { ChessContext } from '../context/ChessContext';
import { useGame } from '../context/GameContext';
import AIGame from './AIGame';
import ChessCoach from './ChessCoach'; // New import

const GameComponent = () => {
  const { chess, resetGame } = useContext(ChessContext);
  const { gameId, userColor, setGameId, leaveGame } = useGame();
  const { user } = useAuth();
  const [showMultiplayer, setShowMultiplayer] = useState(false);

  const handleLogout = async () => {
    try {
      // Clean up game state before logout
      if (gameId) {
        // It's better to use a dedicated function from the game context
        // to properly clean up the game state
        await leaveGame();
      }
      await auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleMultiplayer = () => {
    // If we're hiding multiplayer and in a game, confirm first
    if (showMultiplayer && gameId) {
      if (window.confirm("Leaving multiplayer will end your current game. Continue?")) {
        leaveGame();
        setShowMultiplayer(false);
      }
    } else {
      setShowMultiplayer(!showMultiplayer);
    }
  };

  const handleRestart = () => {
    if (window.confirm("Are you sure you want to restart the game? All progress will be lost.")) {
      resetGame();
    }
  };

  return (
    <div className="app-container">
      <div className="game-header">
        <div className="header-left">
          <div className="profile-section">
            <div className="profile-avatar">👤</div>
            <div className="profile-info">
              <span className="profile-email">{user?.email || 'Guest'}</span>
            </div>
          </div>
          <h1>Kids Chess Game</h1>
          <div className="turn-indicator">
            {chess.turn() === 'w' ? "White's Turn" : "Black's Turn"}
            {gameId && userColor && ` (You are ${userColor === 'w' ? 'White' : 'Black'})`}
          </div>
        </div>
        <div className="header-right">
          <AIGame />
          <button 
            className="multiplayer-btn" 
            onClick={toggleMultiplayer}
          >
            {showMultiplayer ? 'Hide Multiplayer' : 'Play with Friend'}
          </button>
          {showMultiplayer && <GameSetup />}
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
      <div className="game-layout expanded">
        <div className="left-panel expanded">
          <button 
            className="restart-btn"
            onClick={handleRestart}
          >
            🔄 Restart Game
          </button>
          <MoveHistory />
        </div>
        <div className="board-container">
          <ChessBoard />
        </div>
        <div className="right-panel expanded">
          <ChessCoach />
        </div>
      </div>
    </div>
  );
};

export default GameComponent;