import { postHandler } from "@/lib/apiHandler";
import { supabaseServer } from "@/lib/supabase-server";
import { verifyToken } from "@/lib/verifyToken";

interface NewChatRequestBody {
  convId?: string;
  prompt: string;
}

export const POST = postHandler(
  async ({ token, body }: { token: string; body: NewChatRequestBody }) => {
    const { prompt } = body;

    if (!prompt || typeof prompt !== "string") {
      throw new Error("Missing or invalid 'prompt'");
    }

    await verifyToken(token);

    const supabase = supabaseServer(token);

    const { data, error } = await supabase.rpc("create_new_chat", {
      p_message: prompt,
      p_chat_title: prompt.slice(0, 50).trim(),
    });

    if (error) {
      console.error("Supabase insert error:", error);
      throw new Error(error.message || "Failed to create chat");
    }

    // Return structured response
    return { id: data[0]?.id ?? null, ...data[0] };
  },
);
