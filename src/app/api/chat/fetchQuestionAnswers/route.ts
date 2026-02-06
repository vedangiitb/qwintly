import { getHandler } from "@/lib/apiHandler";
import { verifyToken } from "@/lib/verifyToken";
import { getDataSupabase } from "../../../../../infra/supabase/getData";

export const GET = getHandler(async ({ query, token }) => {
  const chatId = query.get("chatId");
  if (!chatId) throw new Error("Missing chatId");

  await verifyToken(token);

  const { data, error } = await getDataSupabase(
    token,
    "questions",
    ["questions", "answers","submitted"],
    { col: "conv_id", value: chatId },
  );

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  const questions = (data[0] as any).questions || [];
  const answers = (data[0] as any).answers || [];
  const submitted = (data[0] as any).submitted || false;

  // --- Return structured response ---
  return {
    questions: questions,
    answers: answers,
    submitted: submitted,
  };
});
