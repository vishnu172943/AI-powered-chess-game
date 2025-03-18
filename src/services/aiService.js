import { GoogleGenerativeAI } from "@google/generative-ai";
import { Chess } from 'chess.js';

const genAI = new GoogleGenerativeAI("AIzaSyASZKJ_vIYSHYbHcFbL8hzOJGzMvi2fir0");

export const getAIMove = async (fen, moveHistory, lastInvalidMove = null) => {
  try {
    const tempChess = new Chess(fen);
    const validMoves = tempChess.moves({ verbose: true });

    // Format valid moves in a clear way for the AI
    const formattedValidMoves = validMoves.map(move => ({
      from: move.from,
      to: move.to,
      piece: move.piece,
      captured: move.captured || null,
      san: move.san,
      flags: move.flags
    }));

    const prompt = `You are a chess engine. Select ONE valid move from the following list:

    Valid Moves Available:
    ${JSON.stringify(formattedValidMoves, null, 2)}

    Instructions:
    1. Choose ONLY from the moves listed above
    2. Return the move in format: "from:e2 to:e4"
    3. No other text or explanation needed

    Return move in specified format only.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer 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',
        'HTTP-Referer': 'https://ai-powered-chess-game.vercel.app',
        'X-Title': 'Chess AI Engine',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat:free', // Updated correct model ID
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 20,
        temperature: 0.3
      })
    });

    const data = await response.json();
    console.log('AI Response:', data);

    const moveText = data.choices[0]?.message?.content?.trim();
    const moveMatch = moveText.match(/from:([a-h][1-8])\s+to:([a-h][1-8])/);
    
    if (!moveMatch) {
      throw new Error('Invalid move format from AI');
    }

    const proposedMove = {
      from: moveMatch[1],
      to: moveMatch[2]
    };

    // Verify the move is in our valid moves list
    const isValidMove = validMoves.some(
      move => move.from === proposedMove.from && move.to === proposedMove.to
    );

    if (!isValidMove) {
      throw new Error('AI suggested move not in valid moves list');
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
