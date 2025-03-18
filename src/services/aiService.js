import { GoogleGenerativeAI } from "@google/generative-ai";
import { Chess } from 'chess.js';

const genAI = new GoogleGenerativeAI("AIzaSyASZKJ_vIYSHYbHcFbL8hzOJGzMvi2fir0");

export const getAIMove = async (fen, moveHistory, lastInvalidMove = null) => {
  try {
    const tempChess = new Chess(fen);
    
    // Get detailed board state
    const boardState = {
      currentBoard: tempChess.board().map((row, rowIndex) => 
        row.map((piece, colIndex) => ({
          piece: piece?.type,
          color: piece?.color,
          square: `${String.fromCharCode(97 + colIndex)}${8 - rowIndex}`,
          isValid: false
        }))
      ),
      validMoves: tempChess.moves({ verbose: true }),
      lastMove: moveHistory[moveHistory.length - 1],
      currentTurn: tempChess.turn(),
      fullMoveHistory: moveHistory
    };

    // Mark valid target squares
    boardState.validMoves.forEach(move => {
      const col = move.to.charCodeAt(0) - 97;
      const row = 8 - parseInt(move.to[1]);
      if (boardState.currentBoard[row] && boardState.currentBoard[row][col]) {
        boardState.currentBoard[row][col].isValid = true;
      }
    });

    console.log('Current FEN:', fen);
    console.log('Valid moves:', tempChess.moves({ verbose: true }));

    // Don't make moves if game is over
    if (tempChess.isGameOver()) {
      throw new Error('Game is already over');
    }

    // Create context of recent moves and any invalid attempts
    const moveContext = {
      recentMoves: moveHistory.slice(-5), // Last 5 moves for context
      invalidAttempts: lastInvalidMove ? [{
        move: lastInvalidMove,
        reason: 'Invalid move - Please suggest a different move'
      }] : [],
      validMoves: tempChess.moves({ verbose: true })
    };

    // Enhanced pawn movement rules with clear first-move rules
    const pawnMovementGuide = `
    STRICT PAWN MOVEMENT RULES:
    1. First Move Only:
       - White pawns on rank 2 (a2-h2) can move one or two squares forward
       - Black pawns on rank 7 (a7-h7) can move one or two squares forward
    2. All Other Moves:
       - Pawns can ONLY move one square forward
       - Pawns capture diagonally one square forward
       - NO backward movement allowed
       - NO horizontal movement allowed
    3. Starting Positions:
       - White pawns start on rank 2 (a2,b2,c2,d2,e2,f2,g2,h2)
       - Black pawns start on rank 7 (a7,b7,c7,d7,e7,f7,g7,h7)
    `;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer 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',
        'HTTP-Referer': 'https://ai-powered-chess-game.vercel.app/',
        'X-Title': 'Kids Chess Game',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat:free',
        messages: [{
          role: 'user',
          content: `Analyze this chess position:

          Current Board State:
          ${JSON.stringify(boardState.currentBoard, null, 2)}
          
          Valid Moves Available:
          ${JSON.stringify(boardState.validMoves, null, 2)}
          
          Last Move Made:
          ${JSON.stringify(boardState.lastMove)}
          
          Game History:
          ${JSON.stringify(boardState.fullMoveHistory.slice(-5))}
          
          Select a valid move from the available moves list.
          Return ONLY the move in format: e2e4`
        }]
      })
    });

    const data = await response.json();
    console.log('AI Response:', data);

    const moveText = data.choices[0]?.message?.content?.trim();
    const move = moveText?.match(/[a-h][1-8][a-h][1-8]/)?.[0];
    
    if (!move) {
      throw new Error('Invalid move format from AI');
    }

    const proposedMove = {
      from: move.substring(0, 2),
      to: move.substring(2, 4)
    };

    // Validate move before returning
    const isValid = tempChess.move(proposedMove);
    if (!isValid) {
      throw new Error(`Invalid move: ${JSON.stringify(proposedMove)}`);
    }

    return proposedMove;
  } catch (error) {
    console.error('AI move error:', error);
    throw error;
  }
};

// Helper function to visualize the board
const visualizeBoard = (fen) => {
  const board = [];
  const fenBoard = fen.split(' ')[0];
  const rows = fenBoard.split('/');
  
  rows.forEach(row => {
    let boardRow = '';
    [...row].forEach(char => {
      if (isNaN(char)) {
        boardRow += char;
      } else {
        boardRow += '.'.repeat(Number(char));
      }
    });
    board.push(boardRow);
  });

  return board.join('\n');
};
