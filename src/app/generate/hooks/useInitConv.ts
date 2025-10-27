"use client";
import { useAuth } from "@/app/login/hooks/AuthContext";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { initConvService } from "../services/chat/initConvService";
import { generateConvId } from "../services/chat/generateConvId";
import { usePrompt } from "./chat/PromptContext";

export const useInitConv = () => {
  const router = useRouter();
  const [loading, setloading] = useState(false);
  const { prompt, setPrompt } = usePrompt();
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
      console.log(user);
      const convId = generateConvId(user.uid);
      initConvService(prompt, convId, user.uid);
      router.push(`/generate/${convId}`);
    },
    [prompt, user, router]
  );

  return { initiateConversation, loading, prompt, setPrompt };
};
