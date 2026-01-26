import { postHandler } from "@/lib/apiHandler";
import { verifyToken } from "@/lib/verifyToken";
import { updateFieldSupabase } from "../../../../../infra/supabase/updateField";

export const POST = postHandler(async ({ token, body }) => {
  const { chatId, answers } = body;
  await verifyToken(token);

  try {
    updateFieldSupabase(
      chatId,
      "answers",
      answers,
      "questions",
      token,
      "conv_id",
    );
  } catch (err) {
    console.error(err);
    throw new Error("Failed to update answers", err);
  }

  return { success: true };
});
