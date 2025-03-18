import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyASZKJ_vIYSHYbHcFbL8hzOJGzMvi2fir0");

export const getChessAdvice = async (fen, moveHistory, playerColor, question, boardState = null) => {
  try {
    // Create game context only for position-specific questions
    const gameContext = boardState ? {
      position: fen,
      turn: playerColor,
      board: boardState,
      lastMoves: moveHistory.slice(-3),
      inCheck: fen.includes('+'),
      material: calculateMaterialBalance(boardState)
    } : null;

    const prompt = `You are a friendly chess coach for children.
      ${gameContext ? `
      Current Game State:
      - Position: ${gameContext.position}
      - Turn: ${gameContext.turn}
      - Material Balance: ${JSON.stringify(gameContext.material)}
      - Recent Moves: ${JSON.stringify(gameContext.lastMoves)}
      ` : ''}

      Question: ${question}

      Please provide:
      1. A ${gameContext ? 'specific analysis of the current position' : 'general chess advice'}
      2. Use simple, kid-friendly language
      3. Keep the response short and encouraging
      4. Include a relevant emoji
      5. Focus on one key point`;

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
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
        temperature: gameContext ? 0.7 : 0.9  // More creative for general questions
      })
    });

    const data = await response.json();
    if (!data || !data.choices || !data.choices[0]?.message?.content) {
      throw new Error('Invalid response from AI');
    }
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Chess coach error:', error);
    throw error;
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
