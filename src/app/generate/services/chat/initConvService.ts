import { toast } from "sonner";
import { fetchUtil } from "@/utils/fetchUtil";

type InitConvResult = {
  id: string | null;
  data?: any;
};

export const initConvService = async (
  prompt: string
): Promise<InitConvResult> => {
  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    const msg = "Missing or empty prompt";
    console.warn("initConvService:", msg);
    toast.error(msg);
    return { id: null };
  }

  try {
    // 🔥 Automatically adds Supabase token inside fetchUtil
    const json = await fetchUtil<{ id: string }>("/api/chat/newchat", {
      method: "POST",
      body: JSON.stringify({ prompt }),
    });

    toast.success("Conversation created!");
    return { id: json.data?.id ?? null, data: json.data };
  } catch (err: any) {
    console.error("initConvService error:", err);
    toast.error(
      err?.message ||
        "Error occurred while creating new chat. Please try again!"
    );
    return { id: null };
  }
};
