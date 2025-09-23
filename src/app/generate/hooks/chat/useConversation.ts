import { useState } from "react";

export const useConversation = () => {
  const [prompt, setPrompt] = useState("");
  const [isResponseLoading, setResponseLoading] = useState(false);
  const [generatingsite, setGeneratingSite] = useState(false);

  const submitPrompt = () => {};

  return { prompt, setPrompt, submitPrompt, isResponseLoading, generatingsite };
};
