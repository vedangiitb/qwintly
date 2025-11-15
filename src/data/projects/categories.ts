interface projectCategory {
  name: string;
  key: string;
  img: string;
  description: string;
}

export const categories: projectCategory[] = [
  {
    name: "Full Stack",
    key: "fullstack",
    img: "/images/fullstack.png",
    description: "Create a full stack application with API & DB",
  },
  {
    name: "Frontend",
    key: "frontend",
    img: "/images/frontend.png",
    description: "React, Next.js, Angular, Vue, Svelte and more",
  },
  {
    name: "Backend",
    key: "backend",
    img: "/images/backend.png",
    description: "Node.js, FastAPI, Spring Boot, Go, Rust APIs",
  },
  {
    name: "AI App",
    key: "ai",
    img: "/images/ai.png",
    description: "RAG, chatbots, embedding apps, content generators",
  },
];
