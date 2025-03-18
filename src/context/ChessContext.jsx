import React, { createContext, useState, useCallback, useMemo, useEffect } from 'react';
import { Chess } from 'chess.js';
import { createGame, updateGameState, subscribeToGame } from '../firestore';
import { useGame } from '../context/GameContext'; // Corrected import path

export const ChessContext = createContext();

export const ChessProvider = ({ children }) => {
  const chess = useMemo(() => new Chess(), []);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [message, setMessage] = useState('');
  const [moves, setMoves] = useState([]);
  const { gameId, userColor, setGameId } = useGame();

  useEffect(() => {
    console.log('ChessContext initialized');
    return () => {
      console.log('ChessContext cleanup');
      chess.reset(); // Reset chess state on cleanup
    };
  }, [chess]);

  const handleMove = useCallback(async (from, to) => {
    try {
      if (gameId && chess.turn() !== userColor?.[0]) {
        setMessage("It's not your turn!");
        return false;
      }

      const move = chess.move({ from, to });
      if (move) {
        // Serialize the move object to ensure Firestore compatibility
        const serializedMove = {
          from: move.from,
          to: move.to,
          piece: move.piece,
          color: move.color,
          san: move.san,
          flags: move.flags,
          captured: move.captured || null,
          timestamp: Date.now()
        };

        if (gameId) {
          await updateGameState(gameId, {
            fen: chess.fen(),
            currentTurn: chess.turn(),
            lastMove: serializedMove,
            moves: [...moves, serializedMove],
            gameStatus: chess.isGameOver() ? 'completed' : 'active'
          });
        }

        setMoves(prev => [...prev, serializedMove]);
        return serializedMove;
      }
    } catch (error) {
      console.error('Move error:', error);
      setMessage('Error making move!');
    }
    return false;
  }, [chess, gameId, userColor, moves]);

  const getHint = useCallback(() => {
    const moves = chess.moves({ verbose: true });
    if (moves.length > 0) {
      const hints = {
        check: 'Look for a move that could threaten the opponent\'s king!',
        capture: 'One of your pieces can capture an opponent\'s piece. Can you find it?',
        promotion: 'Your pawn could advance. Think about pawn promotion!',
        defense: 'Your king might be in danger. Look for defensive moves!',
        development: 'Try moving a piece that hasn\'t moved yet.',
        center: 'Control the center! Look at moves towards the middle squares.',
      };

      const board = chess.board();
      const inCheck = chess.inCheck();
      const possibleCaptures = moves.some(move => move.captured);

      const hasPawnNearPromotion = board.some((row, i) => {
        const isWhiteTurn = chess.turn() === 'w';
        const promotionRow = isWhiteTurn ? 1 : 6;
        const pawnRow = isWhiteTurn ? 2 : 5;

        return i === pawnRow && row.some(piece => 
          piece && piece.type === 'p' && piece.color === chess.turn()
        );
      });

      if (inCheck) {
        setMessage(hints.check);
      } else if (possibleCaptures) {
        setMessage(hints.capture);
      } else if (hasPawnNearPromotion) {
        setMessage(hints.promotion);
      } else if (chess.moveNumber() < 10) {
        setMessage(hints.development);
      } else {
        setMessage(hints.center);
      }
    } else {
      setMessage('Think carefully about your next move!');
    }
  }, [chess]);

  const resetGame = useCallback(() => {
    chess.reset();
    setMoves([]);
    setSelectedPiece(null);
    setLegalMoves([]);
    setMessage('Game reset! Start fresh!');
    setLastInvalidMove(null); // Reset invalid move tracking
  }, [chess]);

  const startNewGame = useCallback(async (userId) => {
    try {
      resetGame();
      const newGameId = await createGame(userId);
      setGameId(newGameId);
      setMessage('New game started!');
    } catch (error) {
      console.error('Failed to create new game:', error);
      setMessage('Failed to create new game');
    }
  }, [resetGame, setGameId]);

  useEffect(() => {
    if (!gameId) return;

    console.log('Setting up game subscription with color:', userColor);
    const unsubscribe = subscribeToGame(gameId, (gameData) => {
      console.log('Received game update:', { 
        currentFen: chess.fen(), 
        newFen: gameData.fen,
        currentTurn: chess.turn(),
        userColor 
      });

      if (gameData.fen && gameData.fen !== chess.fen()) {
        chess.load(gameData.fen);
        setMoves(prev => {
          if (gameData.lastMove) {
            const lastMove = prev[prev.length - 1];
            if (!lastMove || 
                lastMove.from !== gameData.lastMove.from || 
                lastMove.to !== gameData.lastMove.to) {
              return [...prev, gameData.lastMove];
            }
          }
          return prev;
        });

        // Update message for current turn
        const turnColor = chess.turn() === 'w' ? 'White' : 'Black';
        if (chess.turn() === userColor?.[0]) {
          setMessage("It's your turn!");
        } else {
          setMessage(`Waiting for ${turnColor}'s move...`);
        }
      }
    });

    return () => unsubscribe();
  }, [gameId, chess, userColor]);

  const selectPiece = useCallback((square) => {
    const piece = chess.get(square);

    if (gameId && piece && piece.color !== userColor[0]) {
      setMessage("You can only move your own pieces!");
      setSelectedPiece(null);
      setLegalMoves([]);
      return;
    }

    if (piece && piece.color === chess.turn()) {
      setSelectedPiece(square);
      const moves = chess.moves({ square, verbose: true });
      setLegalMoves(moves.map(move => move.to));
    } else {
      setSelectedPiece(null);
      setLegalMoves([]);
    }
  }, [chess, gameId, userColor]);

  useEffect(() => {
    return () => {
      chess.reset();
      setMoves([]);
      setSelectedPiece(null);
      setLegalMoves([]);
      setMessage('');
    };
  }, [chess]);

  return (
    <ChessContext.Provider value={{
      chess,
      selectedPiece,
      setSelectedPiece,
      selectPiece,
      legalMoves,
      setLegalMoves,
      message,
      setMessage,
      moves,
      handleMove,
      getHint,
      resetGame,
      startNewGame,
      gameId
    }}>
      {children}
    </ChessContext.Provider>
  );
};
