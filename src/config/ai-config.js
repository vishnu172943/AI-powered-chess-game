export const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
export const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
export const OPENROUTER_HEADERS = {
  "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
  "HTTP-Referer": import.meta.env.VITE_APP_URL,
  "X-Title": import.meta.env.VITE_APP_NAME,
  "Content-Type": "application/json"
};

export const AI_CONFIG = {
  model: "deepseek/deepseek-chat:free",
  maxRetries: 3,
  temperatures: [0.1, 0.3, 0.7],
  maxTokens: 50,
  waitBetweenRetries: 1000
};
