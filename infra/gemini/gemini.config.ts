import { GoogleGenAI } from "@google/genai";

export const MODEL = "gemini-2.5-flash-lite";

let ai: GoogleGenAI | null = null;

export function getGenAI(): GoogleGenAI {
  if (ai) return ai;

  const key = process.env.GOOGLE_API_KEY;

  if (!key) {
    throw new Error("GOOGLE_API_KEY is not set"); 
  }

  ai = new GoogleGenAI({ apiKey: key });
  return ai;
}
