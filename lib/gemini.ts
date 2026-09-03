import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatMessage } from "./types";

const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";

function getClient() {
  if (!apiKey) return null;
  return new GoogleGenerativeAI(apiKey);
}

export async function generateCharacterReply(
  systemPrompt: string,
  history: ChatMessage[]
): Promise<string> {
  const client = getClient();
  if (!client) {
    return "[DEV MODE] GEMINI_API_KEY не задано в .env.local — це заглушка відповіді персонажа. Додайте безкоштовний ключ з Google AI Studio, щоб отримувати реальні відповіді.";
  }
  const model = client.getGenerativeModel({
    model: modelName,
    systemInstruction: systemPrompt,
  });

  const priorTurns = history.slice(0, -1).map((h) => ({
    role: h.role === "assistant" ? "model" : "user",
    parts: [{ text: h.text }],
  }));
  const last = history[history.length - 1];

  const chat = model.startChat({ history: priorTurns });
  const result = await chat.sendMessage(last.text);
  return result.response.text();
}

export async function generateJudgeReport(prompt: string): Promise<string> {
  const client = getClient();
  if (!client) {
    return JSON.stringify({
      scores: {
        clarity: 60,
        empathy: 60,
        listening: 60,
        facts: 60,
        ownership: 60,
        psychSafety: 60,
      },
      whatWentWell: ["[DEV MODE] Додайте GEMINI_API_KEY в .env.local, щоб отримати реальну оцінку."],
      whatToImprove: ["[DEV MODE] Це заглушка, а не справжній аналіз розмови."],
      practicalTips: ["[DEV MODE] Отримайте безкоштовний ключ на https://aistudio.google.com/app/apikey"],
    });
  }
  const model = client.getGenerativeModel({ model: modelName });
  const result = await model.generateContent(prompt);
  return result.response.text();
}
