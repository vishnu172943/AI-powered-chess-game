import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyASZKJ_vIYSHYbHcFbL8hzOJGzMvi2fir0");

export const getAIMove = async (fen, moveHistory, lastInvalidMove = null) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `As a chess engine analyzing position:
    FEN: ${fen}
    Move History: ${JSON.stringify(moveHistory)}
    ${lastInvalidMove ? `Last suggested move ${lastInvalidMove.from}${lastInvalidMove.to} was invalid. Please suggest a different valid move.` : ''}
    
    Calculate a valid move for ${fen.includes(' b ') ? 'Black' : 'White'}.
    Rules:
    1. Move must be legal according to chess rules
    2. Move must improve position
    3. Consider piece safety and activity
    4. Control central squares
    
    Return ONLY the move in format: e2e4`;

    const result = await model.generateContent(prompt);
    const response = await result.response.text();
    const move = response.trim().match(/[a-h][1-8][a-h][1-8]/)?.[0];
    
    if (move) {
      return {
        from: move.substring(0, 2),
        to: move.substring(2, 4)
      };
    }
    throw new Error('Invalid AI response format');
  } catch (error) {
    console.error('AI move generation error:', error);
    throw error;
  }
};
