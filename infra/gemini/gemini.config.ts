import { GoogleGenAI } from "@google/genai";
export const MODEL = "gemini-2.5-flash-lite";

export const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
