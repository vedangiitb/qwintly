import { supabaseServer } from "@/lib/supabase-server";
import { verifyToken } from "@/lib/verifyToken";
import { UserKeysRepository } from "@/features/byok/server/repositories/userKeys.repository";
import { persistMessage } from "@/features/chat/server/services/persistMessage.service";
import { MessagesRepository } from "@/features/chat/server/repositories/messages.repository";
import { MESSAGE_TYPES, ROLES } from "@/features/chat/types/messages.types";
import { PubSub } from "@google-cloud/pubsub";
import jwt from "jsonwebtoken";
import { getPreferencesService } from "@/features/auth/server/services/getPreferences.service";

type GenerationTriggerPayload = {
  jobToken: string;
  timestamp: number;
};

export type GenerationTriggerResult = {
  success: true;
  messageId: string;
  approvalMessageId: string;
};

export const BYOK_REQUIRED_MESSAGE =
  "API key required. Please add your API key in BYOK settings.";

type GenerationPublisher = {
  publish: (payload: GenerationTriggerPayload) => Promise<string>;
};

class PubSubGenerationPublisher implements GenerationPublisher {
  constructor(
    private readonly pubsubClient: PubSub,
    private readonly topicName: string,
  ) {}

  async publish(payload: GenerationTriggerPayload): Promise<string> {
    return this.pubsubClient.topic(this.topicName).publishMessage({
      data: Buffer.from(JSON.stringify(payload)),
    });
  }
}

const defaultPublisher = new PubSubGenerationPublisher(
  new PubSub({ projectId: process.env.GCP_PROJECT_ID || undefined }),
  process.env.PUBSUB_TOPIC_WEB_GEN,
);

export const generationTriggerService = async (
  chatId: string,
  planId: string,
  token: string,
  publisher: GenerationPublisher = defaultPublisher,
): Promise<GenerationTriggerResult> => {
  try {
    const supabase = supabaseServer(token);
    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }

    const userId = await verifyToken(token);

    const hasKey = await new UserKeysRepository(token).hasAnyKey();
    if (!hasKey) {
      const error = new Error(BYOK_REQUIRED_MESSAGE);
      (error as Error & { statusCode?: number }).statusCode = 403;
      throw error;
    }

    const { data, error } = await supabase.rpc("get_chat_request_type", {
      p_chat_id: chatId,
      p_user_id: userId,
    });

    const userPreferences = await getPreferencesService(userId, token);
    const provider = userPreferences?.pref_provider;
    const model = userPreferences?.pref_model;
    if (error) {
      throw error;
    }
    const requestType = data?.[0]?.request_type;
    if (!requestType) {
      throw new Error("Failed to trigger generation workflow");
    }
    console.log(`Sending ${requestType} pubsub request for chatId: ${chatId}`);

    const approvalMessageId = await persistMessage({
      chatId,
      content: "Plan approved.",
      role: ROLES.USER,
      repo: new MessagesRepository(token),
      type: MESSAGE_TYPES.PLAN,
    });

    const jobToken = jwt.sign(
      {
        userId,
        provider,
        model,
        chatId,
        planId,
        requestType,
      },
      process.env.WORKER_PUBLISH_SECRET!,
      { expiresIn: "20m" },
    );
    const payload: GenerationTriggerPayload = {
      jobToken: jobToken,
      timestamp: Date.now(),
    };
    const messageId = await publisher.publish(payload);
    return { success: true, messageId, approvalMessageId };
  } catch (error) {
    const err = error as Error & { statusCode?: number };
    console.error("Pub/Sub publish failed", {
      chatId,
      message: err?.message,
      stack: err?.stack,
    });

    const wrapped = new Error(err?.message || "Failed to trigger generation.");
    if (typeof err?.statusCode === "number") {
      (wrapped as Error & { statusCode?: number }).statusCode = err.statusCode;
    }
    throw wrapped;
  }
};
