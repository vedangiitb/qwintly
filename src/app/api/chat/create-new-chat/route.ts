import { createChat } from "@/features/chat/server/services/createChat.service";
import { postHandler } from "@/lib/apiHandler";
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

    const id = await createChat(prompt, token);

    return { id };
  },
);
