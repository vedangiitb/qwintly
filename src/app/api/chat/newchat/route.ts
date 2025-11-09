import { supabase } from "@/lib/supabaseClient";
import { postHandler } from "@/lib/apiHandler";

interface NewChatRequestBody {
  convId?: string;
  prompt: string;
}

export const POST = postHandler(
  async ({ userId, body }: { userId: string; body: NewChatRequestBody }) => {
    const { prompt } = body;

    // Validate input
    if (!prompt || typeof prompt !== "string") {
      throw new Error("Missing or invalid 'prompt'");
    }

    // Prepare chat row
    const now = new Date().toISOString();
    const chatRow = {
      user_id: userId,
      title: prompt.slice(0, 50).trim(),
      created_at: now,
      updated_at: now,
      last_message: prompt,
    };

    // Insert into Supabase
    const { data, error } = await supabase
      .from("chats")
      .insert([chatRow])
      .select()
      .limit(1)
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      throw new Error(error.message || "Failed to create chat");
    }

    // Return structured response
    return { id: data?.id ?? null, ...data };
  }
);
