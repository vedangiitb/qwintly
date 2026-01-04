import { GoogleGenAI } from "@google/genai";
export const MODEL = "gemini-2.0-flash";

export const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
