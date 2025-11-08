"use client";
import { createContext, useContext, useState } from "react";

const PromptContext = createContext<any>(null);

export const PromptProvider = ({ children }: { children: React.ReactNode }) => {
  const [prompt, setPrompt] = useState("");
  return (
    <PromptContext.Provider value={{ prompt, setPrompt }}>
      {children}
    </PromptContext.Provider>
  );
};

export const usePrompt = () => useContext(PromptContext);
