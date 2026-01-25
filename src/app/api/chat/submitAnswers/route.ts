import { postHandler } from "@/lib/apiHandler";
import { verifyToken } from "@/lib/verifyToken";
import { updateFieldSupabase } from "../../../../../infra/supabase/updateField";

export const POST = postHandler(async ({ token, body }) => {
  const { id, answers } = body;
  await verifyToken(token);

  try {
    updateFieldSupabase(id, "answers", answers, "questions", token);
  } catch (err) {
    console.error(err);
    return { success: false };
  }

  return { success: true };
});
