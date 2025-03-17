import { db } from './firebase/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot, 
  serverTimestamp,
  arrayUnion,
  writeBatch 
} from 'firebase/firestore';

const GAMES_COLLECTION = 'games';

// Define all functions
const createGame = async (userId) => {
  try {
    const gameData = {
      createdBy: userId,
      createdAt: serverTimestamp(),
      players: {
        white: userId,
        black: null
      },
      currentTurn: 'w',
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      moves: [],
      status: 'waiting',
      winner: null,
      lastMove: null
    };

    const gameRef = doc(collection(db, GAMES_COLLECTION));
    await setDoc(gameRef, gameData);
    return gameRef.id;
  } catch (error) {
    console.error('Error creating game:', error);
    throw error;
  }
};

const joinGame = async (gameId, userId) => {
  try {
    const gameRef = doc(db, GAMES_COLLECTION, gameId);
    const gameSnap = await getDoc(gameRef);
    
    if (!gameSnap.exists()) {
      throw new Error('Game not found');
    }

    const gameData = gameSnap.data();
    if (gameData.players.black) {
      throw new Error('Game is full');
    }

    const updates = {
      'players.black': userId,
      status: 'active',
      lastUpdated: serverTimestamp()
    };

    await updateDoc(gameRef, updates);
    return { id: gameId, ...gameData, ...updates };
  } catch (error) {
    console.error('Error joining game:', error);
    throw error;
  }
};

const joinExistingGame = async (gameId, userId) => {
  try {
    const gameRef = doc(db, GAMES_COLLECTION, gameId);
    const gameSnap = await getDoc(gameRef);
    
    if (!gameSnap.exists()) {
      throw new Error('Game not found');
    }

    const gameData = gameSnap.data();
    if (gameData.players.black) {
      throw new Error('Game is full');
    }

    const updates = {
      'players.black': userId,
      status: 'active',
      lastUpdated: serverTimestamp()
    };

    await updateDoc(gameRef, updates);
    return { id: gameId, ...gameData, ...updates };
  } catch (error) {
    console.error('Error joining existing game:', error);
    throw error;
  }
};

const getGameData = async (gameId) => {
  try {
    const gameRef = doc(db, GAMES_COLLECTION, gameId);
    const gameSnap = await getDoc(gameRef);
    
    if (!gameSnap.exists()) {
      throw new Error('Game not found');
    }

    return { id: gameSnap.id, ...gameSnap.data() };
  } catch (error) {
    console.error('Error getting game:', error);
    throw error;
  }
};

const updateGameState = async (gameId, gameState) => {
  try {
    const gameRef = doc(db, GAMES_COLLECTION, gameId);
    
    // Create a clean object with only serializable data
    const updates = {
      fen: gameState.fen,
      currentTurn: gameState.currentTurn,
      status: gameState.gameStatus || 'active',
      lastUpdated: serverTimestamp()
    };

    // Only include lastMove if it exists and ensure it's serializable
    if (gameState.lastMove) {
      updates.lastMove = {
        from: gameState.lastMove.from,
        to: gameState.lastMove.to,
        piece: gameState.lastMove.piece,
        color: gameState.lastMove.color,
        san: gameState.lastMove.san,
        captured: gameState.lastMove.captured || null,
        timestamp: serverTimestamp()
      };
    }

    // Only include moves if they exist and ensure they're serializable
    if (gameState.moves && Array.isArray(gameState.moves)) {
      updates.moves = gameState.moves.map(move => ({
        from: move.from,
        to: move.to,
        piece: move.piece,
        color: move.color,
        san: move.san,
        captured: move.captured || null
      }));
    }

    await updateDoc(gameRef, updates);
    console.log('Game state updated successfully:', updates);
  } catch (error) {
    console.error('Error updating game:', error);
    throw error;
  }
};

const subscribeToGame = (gameId, callback) => {
  try {
    const gameRef = doc(db, GAMES_COLLECTION, gameId);
    return onSnapshot(
      gameRef,
      { includeMetadataChanges: true },
      (doc) => {
        if (doc.exists()) {
          const data = { id: doc.id, ...doc.data() };
          console.log('Real-time update:', data);
          callback(data);
        }
      }
    );
  } catch (error) {
    console.error('Subscription error:', error);
    throw error;
  }
};

const endGame = async (gameId, winner) => {
  // ...existing code...
};

// Single export statement for all functions
export {
  createGame,
  joinGame,
  getGameData,
  updateGameState,
  subscribeToGame,
  endGame,
  joinExistingGame
};
