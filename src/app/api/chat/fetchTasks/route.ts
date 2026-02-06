import { getHandler } from "@/lib/apiHandler";
import { verifyToken } from "@/lib/verifyToken";
import { getDataSupabase } from "../../../../../infra/supabase/getData";

type TaskRow = {
  tasks: any[];
  implemented: boolean;
  info: CollectedInfo;
};

export const GET = getHandler(async ({ query, token }) => {
  const chatId = query.get("chatId");
  if (!chatId) throw new Error("Missing chatId");
  await verifyToken(token);

  const { data, error } = await getDataSupabase<TaskRow>(
    token,
    "task",
    ["tasks", "implemented", "info"],
    { col: "conv_id", value: chatId },
  );

  // --- Return structured response ---
  if (error) throw error;

  const rows = (data ?? []).map((row) => ({
    tasks: row.tasks ?? [],
    info: row.info ?? {},
    implemented: row.implemented ?? false,
  }));

  return { rows };
});
