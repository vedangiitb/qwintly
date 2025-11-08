import { getAuth } from "firebase/auth";
import { toast } from "sonner";

type InitConvResult = {
  id: string | null;
  data?: any;
};

/**
 * Create a new conversation on the server and return the inserted chat id.
 * Returns `null` on error (and shows a toast).
 */
export const initConvService = async (
  prompt: string,
): Promise<InitConvResult> => {
  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    const msg = "Missing or empty prompt";
    console.warn("initConvService: ", msg);
    toast.error(msg);
    return { id: null };
  }

  try {
    const currentUser = getAuth().currentUser;
    if (!currentUser) throw new Error("User not authenticated");

    const token = await currentUser.getIdToken();
    if (!token) throw new Error("Could not obtain auth token");

    const response = await fetch("/api/chat/newchat", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    const resp = await response.json();

    if (!response.ok || !resp?.success) {
      const errMsg = resp?.error || "Error occurred while creating new chat";
      throw new Error(errMsg);
    }

    const id: string | null = resp?.data?.id ?? null;
    return { id, data: resp?.data };
  } catch (err: any) {
    console.error("initConvService error:", err);
    toast.error(err?.message || "Error occurred while creating new chat, please try again!");
    return { id: null };
  }
};
