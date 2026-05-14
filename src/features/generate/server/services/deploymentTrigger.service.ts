import { supabaseServer } from "@/lib/supabase-server";
import { executeTrigger } from "./executeTrigger.service";

export const deploymentTrigger = async (
  chatId: string,
  gen_session_id: string,
  token: string,
) => {
  const supabase = supabaseServer(token);

  return executeTrigger({
    chatId,
    token,

    topicName: process.env.PUBSUB_TOPIC_WEB_DEPLOY,

    successMessage: "Deployment started.",

    startRpc: () =>
      supabase.rpc("start_deployment", {
        p_chat_id: chatId,
        p_generation_session_id: gen_session_id,
      }),

    finishRpc: async (sessionId) => {
      const { error } = await supabase.rpc("finish_deployment", {
        p_gen_id: sessionId,
        p_success: false,
      });

      if (error) throw error;
    },

    getSessionId: (row: {
      model: string;
      provider: string;
      user_id: string;
      session_id: string;
      plan_id: string;
    }) => row.session_id,

    buildJwtPayload: (row) => ({
      chatId,
      planId: row.plan_id,
      userId: row.user_id,
      provider: row.provider,
      model: row.model,
      sessionId: row.session_id,
      snapshotId: gen_session_id,
    }),
  });
};
