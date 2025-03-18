import React, { useEffect, useRef, useContext, memo, useCallback, useMemo } from 'react';
import p5 from 'p5';
import { ChessContext } from '../context/ChessContext';
import { useGame } from '../context/GameContext';

const createSketch = (props) => (p) => {
  let squareSize;
  let isDragging = false;
  let dragPiece = null;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragStartSquare = null;
  let dragStartPos = { x: 0, y: 0 };
  let lastValidSquare = null;
  
  p.setup = () => {
    p.createCanvas(500, 500).parent(props.sketchRef.current);
    squareSize = p.width / 8;
    p.noLoop(); // disable automatic looping
    p.frameRate(30);
  };

  const drawBoard = () => {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        // Use rich gradients for board squares
        const isLight = (row + col) % 2 === 0;
        const gradient = p.drawingContext.createLinearGradient(
          col * squareSize, 
          row * squareSize, 
          (col + 1) * squareSize, 
          (row + 1) * squareSize
        );

        if (isLight) {
          gradient.addColorStop(0, '#FFEDC3');
          gradient.addColorStop(1, '#FFE4B5');
        } else {
          gradient.addColorStop(0, '#B58863');
          gradient.addColorStop(1, '#8B4513');
        }

        p.drawingContext.fillStyle = gradient;
        p.rect(col * squareSize, row * squareSize, squareSize, squareSize, 0);

        // Add subtle inner shadow
        if (!isLight) {
          p.drawingContext.shadowColor = 'rgba(0, 0, 0, 0.2)';
          p.drawingContext.shadowBlur = 4;
          p.drawingContext.shadowOffsetX = 1;
          p.drawingContext.shadowOffsetY = 1;
        }
      }
    }
    p.drawingContext.shadowColor = 'transparent';
  };

  const highlightLegalMoves = () => {
    if (props.selectedPiece) {
      props.legalMoves.forEach(move => {
        const [col, row] = [move.to.charCodeAt(0) - 97, 8 - parseInt(move.to[1])];
        p.fill('rgba(100, 100, 255, 0.5)');
        p.ellipse(col * squareSize + squareSize / 2, row * squareSize + squareSize / 2, squareSize * 0.6);
      });
    }
  };

  const pieceSymbols = {
    'w': { 
      'p': '♙',
      'r': '♖',
      'n': '♘',
      'b': '♗',
      'q': '♕',
      'k': '♔'
    },
    'b': {
      'p': '♟',
      'r': '♜',
      'n': '♞',
      'b': '♝',
      'q': '♛',
      'k': '♚'
    }
  };

  const drawPieces = () => {
    const board = props.chess.board();

    p.push();
    p.textFont('Arial');
    p.textSize(squareSize * 0.75);
    p.textAlign(p.CENTER, p.CENTER);
    p.textStyle(p.BOLD);
    
    board.forEach((row, rowIndex) => {
      row.forEach((piece, colIndex) => {
        if (piece && (!isDragging || piece !== dragPiece)) {
          const x = colIndex * squareSize + squareSize / 2;
          const y = rowIndex * squareSize + squareSize / 2;
          
          // Add shadow effect to pieces
          p.drawingContext.shadowColor = 'rgba(0, 0, 0, 0.3)';
          p.drawingContext.shadowBlur = 4;
          p.drawingContext.shadowOffsetX = 2;
          p.drawingContext.shadowOffsetY = 2;
          
          p.fill(piece.color === 'w' ? '#FFFFFF' : '#000000');
          p.stroke(piece.color === 'w' ? '#000000' : '#FFFFFF');
          p.strokeWeight(0.5);
          p.text(pieceSymbols[piece.color][piece.type], x, y);
        }
      });
    });

    // Draw dragged piece at mouse position
    if (isDragging && dragPiece) {
      const x = p.mouseX;
      const y = p.mouseY;
      
      // Draw shadow/outline
      p.fill(dragPiece.color === 'w' ? '#000000' : '#FFFFFF');
      p.text(pieceSymbols[dragPiece.color][dragPiece.type], x + 1, y + 1);
      
      // Draw piece
      p.fill(dragPiece.color === 'w' ? '#FFFFFF' : '#000000');
      p.text(pieceSymbols[dragPiece.color][dragPiece.type], x, y);
    }
    p.pop();
  };

  const handleDragStart = (col, row) => {
    const square = String.fromCharCode(97 + col) + (8 - row);
    const piece = props.chess.get(square);

    if (piece && props.canMovePiece(piece)) {
      isDragging = true;
      dragPiece = piece;
      dragStartSquare = square;
      lastValidSquare = square;
      dragStartPos = { x: p.mouseX, y: p.mouseY };
      p.cursor('grab');
      p.loop();
      return true;
    }
    return false;
  };

  p.mousePressed = () => {
    if (p.mouseX < 0 || p.mouseX > p.width || p.mouseY < 0 || p.mouseY > p.height) return;
    
    const col = Math.floor(p.mouseX / squareSize);
    const row = Math.floor(p.mouseY / squareSize);
    handleDragStart(col, row);
  };

  p.mouseDragged = () => {
    if (!isDragging) return;
    
    const col = Math.floor(p.mouseX / squareSize);
    const row = Math.floor(p.mouseY / squareSize);
    
    if (col >= 0 && col < 8 && row >= 0 && row < 8) {
      const currentSquare = String.fromCharCode(97 + col) + (8 - row);
      if (currentSquare !== lastValidSquare) {
        lastValidSquare = currentSquare;
        const moves = props.chess.moves({ square: dragStartSquare, verbose: true });
        const isValidMove = moves.some(move => move.to === currentSquare);
        p.cursor(isValidMove ? 'pointer' : 'not-allowed');
      }
    }
  };

  p.mouseReleased = () => {
    // Force redraw to update final mouse position
    p.redraw();
    if (!isDragging) return;
    
    const col = Math.floor(p.mouseX / squareSize);
    const row = Math.floor(p.mouseY / squareSize);
    
    if (col >= 0 && col < 8 && row >= 0 && row < 8) {
      const targetSquare = String.fromCharCode(97 + col) + (8 - row);
      if (targetSquare !== dragStartSquare) {
        console.log('Attempting move:', { from: dragStartSquare, to: targetSquare });
        props.onMove(dragStartSquare, targetSquare);
      }
    }
    
    isDragging = false;
    dragPiece = null;
    dragStartSquare = null;
    p.cursor('default');
    props.onPieceRelease();
    p.noLoop();
  };

  // Add mouseOut event to trigger drop when mouse leaves canvas
  p.mouseOut = p.mouseReleased;

  p.draw = () => {
    p.clear();
    drawBoard();
    if (props.legalMoves && props.selectedPiece) {
      highlightLegalMoves();
    }
    drawPieces();
  };

  // Override default frame loop behavior
  p.noLoop();
};

const ChessBoard = memo(() => {
  const sketchRef = useRef();
  const p5InstanceRef = useRef(null);
  const { chess, handleMove, selectedPiece, setSelectedPiece, legalMoves, setLegalMoves, setMessage } = useContext(ChessContext);
  const { gameId, userColor } = useGame();

  // Use useCallback for stable reference across renders
  const handlePieceSelect = useCallback((square, piece) => {
    setSelectedPiece({ square, piece });
    setLegalMoves(chess.moves({ square, verbose: true }));
    setMessage(`Selected ${square}`);
  }, [chess, setSelectedPiece, setLegalMoves, setMessage]);

  const handlePieceRelease = useCallback(() => {
    setSelectedPiece(null);
    setLegalMoves([]);
  }, [setSelectedPiece, setLegalMoves]);

  // Add validation for piece movement
  const canMovePiece = useCallback((piece) => {
    if (!gameId) return true; // Allow moves in local game
    if (!piece || !userColor) return false;
    
    const isCorrectColor = piece.color === userColor[0];
    const isPlayersTurn = chess.turn() === userColor[0];
    
    console.log('Move validation:', { 
      piece, 
      userColor, 
      isCorrectColor, 
      isPlayersTurn 
    });
    
    return isCorrectColor && isPlayersTurn;
  }, [gameId, userColor, chess]);

  useEffect(() => {
    if (gameId && chess.turn() === userColor?.[0]) {
      setMessage("It's your turn!");
    }
  }, [chess.turn(), gameId, userColor]);

  // Pre-load and optimize sounds
  const moveSound = useMemo(() => {
    const audio = new Audio('/sounds/ficha-de-ajedrez-34722.mp3');
    audio.preload = 'auto'; // Preload the sound
    audio.volume = 0.6; // Reduce volume for better performance
    return audio;
  }, []);

  const captureSound = useMemo(() => {
    const audio = new Audio('/sounds/chess-pieces-hitting-wooden-board-99336.mp3');
    audio.preload = 'auto';
    audio.volume = 0.6;
    return audio;
  }, []);

  // Optimized sound playing function
  const playMoveSound = useCallback((move) => {
    try {
      const sound = move.captured ? captureSound : moveSound;
      
      // Reset and play with timeout to prevent overlapping
      sound.currentTime = 0;
      const playPromise = sound.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn('Sound playback failed:', error);
        });
      }
    } catch (error) {
      console.warn('Sound error:', error);
    }
  }, [moveSound, captureSound]);

  useEffect(() => {
    const sketch = createSketch({
      sketchRef,
      chess,
      selectedPiece,
      legalMoves,
      userColor: userColor?.[0],
      canMovePiece,
      onPieceSelect: (square, piece) => {
        if (!canMovePiece(piece)) {
          setMessage("Not your turn or piece!");
          return;
        }
        console.log('Piece selected:', { square, piece });
        setSelectedPiece({ square, piece });
        const moves = chess.moves({ square, verbose: true });
        setLegalMoves(moves);
      },
      onPieceRelease: handlePieceRelease,
      onMove: async (from, to) => {
        console.log('Move requested:', { from, to });
        const result = await handleMove(from, to);
        if (!result) {
          setMessage('Invalid move!');
        } else {
          playMoveSound(result);
        }
      }
    });

    p5InstanceRef.current = new p5(sketch);

    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
      }
    };
  }, [chess, gameId, userColor, handleMove, selectedPiece, legalMoves, canMovePiece, handlePieceRelease, playMoveSound]);

  // Force redraw when game state changes
  useEffect(() => {
    if (p5InstanceRef.current) {
      p5InstanceRef.current.redraw();
    }
  }, [chess.fen(), selectedPiece, legalMoves]);

  useEffect(() => {
    // Cleanup sounds on unmount
    return () => {
      moveSound.pause();
      captureSound.pause();
      moveSound.currentTime = 0;
      captureSound.currentTime = 0;
    };
  }, [moveSound, captureSound]);

  return <div ref={sketchRef} style={{ width: 500, height: 500, cursor: 'default' }}></div>;
});

export default ChessBoard;