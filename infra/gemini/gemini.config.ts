import { GoogleGenAI } from "@google/genai";
export const MODEL = "gemini-2.5-flash-lite";

if (!process.env.GOOGLE_API_KEY) {
  throw new Error("Missing GOOGLE_API_KEY environment variable");
}

export const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
