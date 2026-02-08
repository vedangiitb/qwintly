import "server-only";
import { GoogleGenAI } from "@google/genai";

export const MODEL = "gemini-2.5-flash-lite";

export function getGenAI() {
  let ai: GoogleGenAI | null = null;
  const key = process.env.GOOGLE_API_KEY;

  // Build-time safe: return null
  if (!key) return null;

  if (!ai) {
    ai = new GoogleGenAI({ apiKey: key });
  }

  return ai;
}

export const ai = getGenAI();
