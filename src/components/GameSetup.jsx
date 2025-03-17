import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

const GameSetup = () => {
  const [joinGameId, setJoinGameId] = useState('');
  const { startNewGame, joinGame, gameId, gameData, isJoined } = useGame();
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCreateGame = async () => {
    try {
      const newGameId = await startNewGame();
      if (newGameId) {
        copyToClipboard(newGameId);
      }
    } catch (err) {
      setError(typeof err === 'string' ? err : err.message || 'Failed to create game');
    }
  };

  const copyToClipboard = (text) => {
    try {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for browsers without clipboard API support
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleJoinGame = async () => {
    setError('');
    try {
      if (!joinGameId.trim()) {
        setError('Please enter a game ID');
        return;
      }
      await joinGame(joinGameId.trim());
      console.log('Successfully joined game');
    } catch (err) {
      console.error('Error joining game:', err);
      setError(typeof err === 'string' ? err : err.message || 'Failed to join game');
    }
  };

  const handleCopyId = () => {
    copyToClipboard(gameId);
  };

  return (
    <div className="game-setup">
      {!gameId ? (
        <div className="setup-options">
          <button onClick={handleCreateGame} className="create-btn">Create New Game</button>
          <div className="join-game">
            <form onSubmit={(e) => {
              e.preventDefault();
              handleJoinGame();
            }}>
              <input
                type="text"
                value={joinGameId}
                onChange={(e) => setJoinGameId(e.target.value)}
                placeholder="Enter Game ID"
              />
              <button type="submit">Join Game</button>
            </form>
          </div>
          {error && <div className="error-message">{error}</div>}
        </div>
      ) : (
        <div className="game-status">
          <div className="game-id-display">
            <span>Game ID: {gameId}</span>
            <button className="copy-btn" onClick={handleCopyId}>
              {copied ? 'Copied!' : 'Copy ID'}
            </button>
          </div>
          <div className="player-status">
            {gameData?.status === 'active' 
              ? 'Game in progress'
              : isJoined 
                ? 'Waiting for opponent...'
                : 'Connecting to game...'}
          </div>
          {error && <div className="error-message">{error}</div>}
        </div>
      )}
    </div>
  );
};

export default GameSetup;