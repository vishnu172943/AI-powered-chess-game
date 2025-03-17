import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth } from '../firebase/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { 
  createGame, 
  getGameData, 
  updateGameState, 
  subscribeToGame,
  joinExistingGame  // Make sure to import it
} from '../firestore';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
  const [gameId, setGameId] = useState(null);
  const [players, setPlayers] = useState({ white: null, black: null });
  const [gameStatus, setGameStatus] = useState('waiting');
  const [userColor, setUserColor] = useState(null);
  const [isJoined, setIsJoined] = useState(false);
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const startNewGame = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Creating new game...');
      const newGameId = await createGame(auth.currentUser.uid);
      setGameId(newGameId);
      setPlayers({ white: auth.currentUser.uid, black: null });
      setUserColor('w');
      setIsJoined(true);
      console.log('Game created:', newGameId);
      setLoading(false);
      return newGameId;
    } catch (error) {
      console.error('Error starting new game:', error);
      setError('Failed to create game: ' + error.message);
      setLoading(false);
      throw error;
    }
  };

  const joinGame = async (joinId) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Attempting to join game:', joinId);
      const fetchedGameData = await getGameData(joinId);
      
      if (!fetchedGameData) {
        throw new Error('Game not found');
      }

      // Check if user is already in the game
      const currentUserId = auth.currentUser.uid;
      if (fetchedGameData.players.white === currentUserId || 
          fetchedGameData.players.black === currentUserId) {
        setGameId(joinId);
        setUserColor(fetchedGameData.players.white === currentUserId ? 'w' : 'b');
        setGameData(fetchedGameData);
        setPlayers(fetchedGameData.players);
        setGameStatus(fetchedGameData.status);
        setIsJoined(true);
        setLoading(false);
        return;
      }

      // Fixed: Using joinExistingGame instead of recursive call to joinGame
      const updatedGame = await joinExistingGame(joinId, currentUserId);
      setGameId(joinId);
      setUserColor('b');
      setGameData(updatedGame);
      setPlayers(updatedGame.players);
      setGameStatus('active');
      setIsJoined(true);
      console.log('Successfully joined game:', updatedGame);
      setLoading(false);
    } catch (error) {
      console.error('Error joining game:', error);
      setError('Failed to join game: ' + error.message);
      setLoading(false);
      throw error;
    }
  };

  const makeMove = async (move) => {
    try {
      setLoading(true);
      await updateGameState(gameId, move);
      setLoading(false);
    } catch (error) {
      console.error('Error making move:', error);
      setError('Failed to make move: ' + error.message);
      setLoading(false);
      throw error;
    }
  };

  const handleGameUpdate = useCallback((newGameData) => {
    if (!newGameData) return;
    
    console.log('Game update received:', newGameData);
    setGameData(newGameData);
    setGameStatus(newGameData.status);
    setPlayers(newGameData.players);

    // Update UI based on game status
    if (newGameData.status === 'active') {
      setIsJoined(true);
    }
  }, []);

  useEffect(() => {
    if (!gameId) return;

    console.log('Setting up game listener for:', gameId);
    const unsubscribe = subscribeToGame(gameId, handleGameUpdate);

    return () => {
      console.log('Cleaning up game subscription');
      unsubscribe();
    };
  }, [gameId, handleGameUpdate]);

  // Reset game state when user logs out
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        // User logged out, reset game state
        setGameId(null);
        setPlayers({ white: null, black: null });
        setGameStatus('waiting');
        setUserColor(null);
        setIsJoined(false);
        setGameData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const resetGame = () => {
    setGameId(null);
    setPlayers({ white: null, black: null });
    setGameStatus('waiting');
    setUserColor(null);
    setIsJoined(false);
    setGameData(null);
    setError(null);
  };

  // Add leaveGame function
  const leaveGame = useCallback(async () => {
    if (!gameId) return;
    
    try {
      const gameRef = doc(db, 'games', gameId);
      await updateDoc(gameRef, {
        status: 'ended',
        lastUpdated: serverTimestamp()
      });
      resetGame();
    } catch (error) {
      console.error('Error leaving game:', error);
    }
  }, [gameId]);

  const value = {
    gameId,
    players,
    gameStatus,
    userColor,
    isJoined,
    gameData,
    loading,
    error,
    startNewGame,
    joinGame,
    makeMove,
    resetGame,
    leaveGame,
    setGameId // Add setGameId to context
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};