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
    ["contents"],
    { col: "conv_id", value: chatId },
  );

  const collectedInfo = data;

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  // --- Return structured response ---
  return {
    collectedInfo: collectedInfo,
  };
});
