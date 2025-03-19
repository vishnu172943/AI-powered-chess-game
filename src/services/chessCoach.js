import axios from 'axios';
import { OPENROUTER_ENDPOINT, OPENROUTER_HEADERS, AI_CONFIG } from '../config/ai-config';

const api = axios.create({
  timeout: 10000,
  headers: OPENROUTER_HEADERS
});

export const getChessAdvice = async (question) => {
  try {
    const payload = {
      model: AI_CONFIG.model,
      messages: [{
        role: "user",
        content: `You are an elite chess coach. Provide concise advice for: ${question}. Keep response under 3 sentences.`
      }],
      temperature: 0.7,
      max_tokens: 150
    };

    const response = await api.post(OPENROUTER_ENDPOINT, payload);
    return response.data.choices[0]?.message?.content || "I need a moment to think about this position...";
  } catch (error) {
    console.error('Chess coach error:', error);
    return "I apologize, I'm having trouble analyzing right now.";
  }
};

export const getDeepSeekResponse = async (userInput) => {
  try {
    const payload = {
      model: AI_CONFIG.model,
      messages: [{
        role: "user",
        content: `You are a friendly chess assistant. ${userInput}`
      }],
      temperature: 0.7,
      max_tokens: 150
    };

    const response = await api.post(OPENROUTER_ENDPOINT, payload);
    return response.data.choices[0]?.message?.content || "I'm having trouble processing that request.";
  } catch (error) {
    console.error('Assistant error:', error);
    return "I apologize, I'm experiencing technical difficulties.";
  }
};

// Helper functions for board analysis
function analyzePiecePositions(fen) {
  const pieces = {
    pawns: [], bishops: [], knights: [],
    rooks: [], queens: [], kings: []
  };
  const board = fen.split(' ')[0].split('/');
  
  board.forEach((row, rankIndex) => {
    let fileIndex = 0;
    [...row].forEach(char => {
      if (isNaN(char)) {
        const square = `${String.fromCharCode(97 + fileIndex)}${8 - rankIndex}`;
        const color = char === char.toUpperCase() ? 'white' : 'black';
        const piece = char.toLowerCase();
        
        switch(piece) {
          case 'p': pieces.pawns.push({ color, square }); break;
          case 'b': pieces.bishops.push({ color, square }); break;
          case 'n': pieces.knights.push({ color, square }); break;
          case 'r': pieces.rooks.push({ color, square }); break;
          case 'q': pieces.queens.push({ color, square }); break;
          case 'k': pieces.kings.push({ color, square }); break;
        }
        fileIndex++;
      } else {
        fileIndex += parseInt(char);
      }
    });
  });
  return pieces;
}

function calculateMaterialBalance(fen) {
  const values = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
  let white = 0, black = 0;
  
  fen.split(' ')[0].split('').forEach(char => {
    if (isNaN(char) && char !== '/') {
      const value = values[char.toLowerCase()] || 0;
      if (char === char.toUpperCase()) white += value;
      else black += value;
    }
  });
  
  return { white, black, advantage: white - black };
}

function analyzeCenterControl(fen) {
  const centerSquares = ['e4', 'd4', 'e5', 'd5'];
  const pieces = analyzePiecePositions(fen);
  return centerSquares.map(square => {
    const attackers = findAttackersOfSquare(square, pieces);
    return { square, attackers };
  });
}

function analyzePieceDevelopment(fen) {
  const pieces = analyzePiecePositions(fen);
  const undevelopedPieces = {
    white: findUndevelopedPieces(pieces, 'white'),
    black: findUndevelopedPieces(pieces, 'black')
  };
  return undevelopedPieces;
}

function findThreats(fen) {
  // Analyze immediate threats and tactical opportunities
  const pieces = analyzePiecePositions(fen);
  return {
    checks: findCheckThreats(pieces),
    captures: findCaptureThreats(pieces),
    forks: findForkOpportunities(pieces)
  };
}

// ... additional helper functions for threat detection ...

// Helper function to visualize board (same as in aiService.js)
const visualizeBoard = (fen) => {
  // ...existing visualization code...
};
