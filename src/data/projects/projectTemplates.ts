export interface templateInterface {
  name: string;
  key: string;
  description: string;
  features: string[];
}
export const templatesByCategory = {
  fullstack: [
    {
      name: "Next.js + Supabase",
      key: "next-supabase",
      description: "Full stack app with auth, DB, and APIs.",
      features: ["Auth", "Database", "API Routes"],
    },
    {
      name: "Next.js + Firebase",
      key: "next-firebase",
      description: "Google auth, Firestore DB, storage.",
      features: ["Firebase Auth", "Firestore", "Storage"],
    },
    {
      name: "Django + React",
      key: "django-react",
      description: "Django REST backend + React UI.",
      features: ["Django REST", "React UI"],
    },
  ],

  frontend: [
    {
      name: "React (Vite)",
      key: "react-vite",
      description: "Lightweight React project with Vite.",
      features: ["Hot Reload", "Fast Dev Server"],
    },
    {
      name: "Next.js (Frontend)",
      key: "next-frontend",
      description: "Next.js without backend features.",
      features: ["SSR", "Routing", "Static Export"],
    },
  ],

  backend: [
    {
      name: "Node.js + Express",
      key: "express",
      description: "REST API template with Express.",
      features: ["Routing", "Middleware", "Controllers"],
    },
    {
      name: "FastAPI",
      key: "fastapi",
      description: "Python API framework with automatic docs.",
      features: ["Swagger Docs", "Fast", "Typed"],
    },
  ],

  ai: [
    {
      name: "RAG Chatbot",
      key: "rag-chat",
      description: "Chatbot with vector DB + OpenAI.",
      features: ["Embeddings", "Query Engine", "Chat UI"],
    },
    {
      name: "Content Generator",
      key: "ai-writer",
      description: "Full-stack app that generates text or blogs.",
      features: ["OpenAI API", "Editor UI"],
    },
  ],
};
