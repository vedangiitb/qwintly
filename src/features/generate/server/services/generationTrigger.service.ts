import { supabaseServer } from "@/lib/supabase-server";
import { executeTrigger } from "./executeTrigger.service";

export const generationTrigger = async (
  chatId: string,
  planId: string,
  token: string,
) => {
  const supabase = supabaseServer(token);

  return executeTrigger({
    chatId,
    token,

    topicName: process.env.PUBSUB_TOPIC_WEB_GEN,

    successMessage: "Plan approved.",

    startRpc: () =>
      supabase.rpc("start_generation", {
        p_chat_id: chatId,
        p_plan_id: planId,
      }),

    finishRpc: async (sessionId) => {
      const { error } = await supabase.rpc("finish_generation", {
        p_gen_id: sessionId,
        p_success: false,
      });

      if (error) throw error;
    },

    getSessionId: (row: {
      prev_session_id: string;
      request_type: string;
      model: string;
      provider: string;
      user_id: string;
      session_id: string;
      byok_enabled: boolean;
    }) => row.session_id,

    buildJwtPayload: (row) => ({
      chatId,
      planId,
      userId: row.user_id,
      requestType: row.request_type,
      provider: row.provider,
      model: row.model,
      prevSessionId: row.prev_session_id,
      sessionId: row.session_id,
      byokEnabled: row.byok_enabled,
    }),
  });
};
