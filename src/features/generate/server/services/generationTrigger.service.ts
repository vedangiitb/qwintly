import { supabaseServer } from "@/lib/supabase-server";
import { verifyToken } from "@/lib/verifyToken";
import { PubSub } from "@google-cloud/pubsub";
import jwt from "jsonwebtoken";

type GenerationTriggerPayload = {
  jobToken: string;
  timestamp: number;
};

export type GenerationTriggerResult = {
  success: true;
  messageId: string;
};

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

const DEFAULT_PROVIDER = "gemini";

export const generationTriggerService = async (
  chatId: string,
  planId: string,
  token: string,
  publisher: GenerationPublisher = defaultPublisher,
  provider: string = DEFAULT_PROVIDER,
): Promise<GenerationTriggerResult> => {
  try {
    const supabase = supabaseServer(token);
    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }

    const userId = await verifyToken(token);

    const { data, error } = await supabase.rpc("get_chat_request_type", {
      p_chat_id: chatId,
      p_user_id: userId,
    });
    if (error) {
      throw error;
    }
    const requestType = data?.[0]?.request_type;
    if (!requestType) {
      throw new Error("Failed to trigger generation workflow");
    }
    console.log(`Sending ${requestType} pubsub request for chatId: ${chatId}`);

    const jobToken = jwt.sign(
      {
        userId,
        provider,
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
    return { success: true, messageId };
  } catch (error) {
    console.error("Pub/Sub publish failed", {
      chatId,
      message: error.message,
      stack: error.stack,
    });
    throw new Error(error.message);
  }
};
