import { aiPlatforms } from "./configs/aiPlatforms";

export const configOptionsByTemplate = {
  "next-supabase": {
    auth: true,
    db: ["Supabase Postgres"],
    storage: true,
    ai: aiPlatforms,
    payments: ["Stripe"],
  },

  "next-firebase": {
    auth: true,
    db: ["Firestore"],
    storage: true,
    ai: aiPlatforms,
    payments: [],
  },

  "react-vite": {
    auth: false,
    db: [],
    storage: false,
    ai: [],
    payments: [],
  },

  fastapi: {
    auth: false,
    db: ["Postgres", "SQLite"],
    storage: false,
    ai: ["OpenAI"],
    payments: [],
  },
};
