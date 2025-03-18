import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyASZKJ_vIYSHYbHcFbL8hzOJGzMvi2fir0");

export const getChessAdvice = async (fen, moveHistory, playerColor, question) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    // Check if it's a chess-related question
    const isChessQuestion = question.toLowerCase().includes('move') || 
                          question.toLowerCase().includes('position') ||
                          question.toLowerCase().includes('piece') ||
                          question.toLowerCase().includes('play') ||
                          question.toLowerCase().includes('strategy');

    let prompt;
    if (isChessQuestion) {
      prompt = `You are a friendly and encouraging chess coach teaching a child.
      Current position: ${fen}
      Player's Color: ${playerColor}
      Question: ${question}

      Provide a helpful, encouraging response that:
      1. Shows enthusiasm and support
      2. Explains concepts in simple terms
      3. Uses positive reinforcement
      4. Keeps advice brief and clear
      5. Includes a fun emoji at the start

      Format: Start with an encouraging phrase, then give specific advice.`;
    } else {
      prompt = `You are a friendly chess coach having a casual conversation with a young student.
      Previous context: You're their favorite chess teacher who enjoys making the game fun.
      
      Question/Comment: ${question}

      Respond in a way that:
      1. Is warm and friendly
      2. Shows personality and humor
      3. Maintains the mentor-student relationship
      4. May include a fun chess reference if relevant
      5. Uses appropriate emojis
      
      Keep the tone light and encouraging, like talking to a friend while still being respectful.`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response.text();
    return response.trim();
  } catch (error) {
    console.error('Chess coach analysis error:', error);
    throw error;
  }
};
