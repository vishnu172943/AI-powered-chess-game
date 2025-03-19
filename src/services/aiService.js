import { Chess } from 'chess.js';
import axios from 'axios';
import { OPENROUTER_ENDPOINT, OPENROUTER_HEADERS, AI_CONFIG } from '../config/ai-config';

// Create axios instance with default config
const api = axios.create({
  timeout: 10000,
  headers: OPENROUTER_HEADERS
});

// Helper function to wait between retries
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getAIMove = async (fen, moveHistory, lastInvalidMove = null) => {
  let lastError = null;

  for (let attempt = 0; attempt < AI_CONFIG.maxRetries; attempt++) {
    try {
      const tempChess = new Chess(fen);
      const validMoves = tempChess.moves({ verbose: true });
      
      // Simplified move format for clearer AI understanding
      const formattedMoves = validMoves.map(move => ({
        notation: move.san,
        from: move.from,
        to: move.to
      }));

      const payload = {
        model: AI_CONFIG.model,
        messages: [{
          role: "user",
          content: `As a chess engine, select a valid move from: ${JSON.stringify(formattedMoves)}. Current FEN: ${fen}. Previous moves: ${JSON.stringify(moveHistory?.slice(-2))}. Respond ONLY with move in format "from:e2 to:e4"`
        }],
        temperature: AI_CONFIG.temperatures[attempt],
        max_tokens: AI_CONFIG.maxTokens
      };

      const response = await api.post(OPENROUTER_ENDPOINT, payload);
      const moveText = response.data.choices[0]?.message?.content?.trim();
      console.log('AI response:', moveText); // For debugging

      const moveMatch = moveText.match(/from:([a-h][1-8])\s+to:([a-h][1-8])/);
      
      if (!moveMatch) {
        throw new Error('Invalid move format received');
      }

      const proposedMove = {
        from: moveMatch[1],
        to: moveMatch[2]
      };

      // Verify move is valid
      if (validMoves.some(move => move.from === proposedMove.from && move.to === proposedMove.to)) {
        console.log('Valid move found:', proposedMove);
        return proposedMove;
      }

      throw new Error('Move not in valid moves list');
    } catch (error) {
      if (error.response?.status === 503) {
        // Model is loading, wait longer
        await wait(AI_CONFIG.waitBetweenRetries * 2);
      }
      console.error(`Attempt ${attempt + 1} failed:`, error.message);
      lastError = error;
      await wait(AI_CONFIG.waitBetweenRetries);
    }
  }

  throw new Error(`Failed after ${AI_CONFIG.maxRetries} attempts. Last error: ${lastError?.message}`);
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
