import { toast } from "sonner";

export const initConvService = async (
  prompt: string,
  convId: string,
  uid: string
) => {
  if (!prompt) return;

  try {
    const response = await fetch("/api/chat/newchat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: convId,
        userId: uid,
        prompt: prompt,
      }),
    });

    const resp = await response.json();

    if (!resp.ok) {
      throw new Error(resp.error || "Error occured while creating new chat");
    }
  } catch (e) {
    console.error(e || "Error occured while creating new chat");
    // TODO: Replace this with a new way to render errors
    toast.error("Error occured while creating new chat, please try again!");
  }
};
