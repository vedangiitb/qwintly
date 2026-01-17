"use client";
import { useAuth } from "@/app/login/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { initConvService } from "../services/chat/initConvService";
import { useChat } from "./useChat";

export const useInitConv = () => {
  const router = useRouter();
  const [loading, setloading] = useState(false);
  const { prompt } = useChat();
  const { user } = useAuth();

  const initiateConversation = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!user) {
        router.push("/login");
        toast("Please login to continue");
        return;
      }
      if (!prompt.trim()) return;
      setloading(true);

      try {
        const result = await initConvService(prompt);

        const convId = result?.id ?? null;

        if (convId && typeof convId === "string" && convId.trim()) {
          // optionally clear the prompt before navigating
          router.push(`/generate/${convId}`);
        } else {
          console.error("initConvService did not return a valid id:", result);
          toast.error("Could not create conversation. Please try again.");
        }
      } catch (err) {
        console.error("Error initiating conversation:", err);
        toast.error("Could not create conversation. Please try again.");
      } finally {
        setloading(false);
      }
    },
    [prompt, user, router]
  );

  return { initiateConversation, loading, prompt };
};
