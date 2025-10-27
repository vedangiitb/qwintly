"use client";

import React, { useEffect, useState } from "react";
import { usePrompt } from "../hooks/chat/PromptContext";
import ChatHistory from "../components/chat/ChatHistory";
import ChatBox from "../components/chat/ChatBox";

type Props = { params: Promise<{ id: string }> };

export default function Generate({ params }: Props) {
  const { prompt, setPrompt } = usePrompt();
  const [messages, setMessages] = useState<Chat[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [generatingsite, setSiteGenerating] = useState(false);

  console.log(prompt);

  // Something like useEffect which sees if prompt is not empty and then creates an SSE
  // prompt is accessed from useInitConv
  // while navigating from a page having prompt typed or sent, first clear the prompt before navigating
  const { id } = React.use(params);

  async function startStream(prompt: string) {
    setIsStreaming(true);
    let responseText = "";

    const response = await fetch("/api/chat/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId: (await params).id, prompt }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    while (reader) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const text = line.replace("data: ", "");
          if (text === "[DONE]") {
            setIsStreaming(false);
            break;
          }
          responseText += text;
          setMessages((msgs: Chat[]) => {
            const last = msgs[msgs.length - 1];
            if (last?.role === "assistant") {
              return [
                ...msgs.slice(0, -1),
                { role: "assistant", content: responseText },
              ];
            } else {
              return [...msgs, { role: "assistant", content: responseText }];
            }
          });
        }
      }
    }
  }

  useEffect(() => {
    console.log(prompt, id);
    if (prompt && id) {
      submitResponse(prompt);
    }
  }, [id]);

  const submitResponse = (prompt: string) => {
    setMessages([{ role: "user", content: prompt }]);
    startStream(prompt);
    setPrompt("");
  };
  return (
    <div className="pl-4 pr-2 pb-2 h-full flex flex-col justify-between overflow-hidden shadow-xl backdrop-blur-2xl bg-background">
      <ChatHistory
        convHistory={messages}
        isResponseLoading={false}
        generatingsite={generatingsite}
      />
      <ChatBox
        prompt={prompt}
        submitPrompt={submitResponse}
        setPrompt={setPrompt}
        isResponseLoading={false}
      />
    </div>
  );
}
