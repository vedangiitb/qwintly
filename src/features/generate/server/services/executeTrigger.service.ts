import { MessagesRepository } from "@/features/chat/server/repositories/messages.repository";
import { persistMessage } from "@/features/chat/server/services/persistMessage.service";
import {
  MESSAGE_TYPES,
  MessageType,
  ROLES,
} from "@/features/chat/types/messages.types";
import { createHttpError, wrapHttpError } from "@/lib/httpError";
import { requireEnv } from "@/lib/require";
import { PubSub } from "@google-cloud/pubsub";
import jwt from "jsonwebtoken";
type StartRpcResult<T> = {
  data: T[] | null;
  error: unknown;
};

type TriggerConfig<TStartRow> = {
  startRpc: () => PromiseLike<StartRpcResult<TStartRow>>;

  finishRpc: (sessionId: string) => Promise<void>;

  buildJwtPayload: (row: TStartRow) => Record<string, unknown>;

  topicName: string | undefined;

  successMessage: string;

  getSessionId: (row: TStartRow) => string;
};

export type TriggerPayload = {
  jobToken: string;
  timestamp: number;
};

type GenerationPublisher = {
  publish: (payload: TriggerPayload) => Promise<string>;
};

export class PubSubGenerationPublisher implements GenerationPublisher {
  constructor(
    private readonly pubsubClient: PubSub,
    private readonly topicName: string,
  ) {}

  async publish(payload: TriggerPayload): Promise<string> {
    return this.pubsubClient.topic(this.topicName).publishMessage({
      data: Buffer.from(JSON.stringify(payload)),
    });
  }
}

export function createPubSubPublisherFromEnv(
  topicName: string | undefined,
): PubSubGenerationPublisher {
  if (!topicName || !topicName.trim()) {
    throw createHttpError(500, "Pub/Sub topic name is not configured");
  }

  return new PubSubGenerationPublisher(
    new PubSub({ projectId: process.env.GCP_PROJECT_ID || undefined }),
    topicName,
  );
}

export async function executeTrigger<TStartRow>({
  startRpc,
  finishRpc,
  buildJwtPayload,
  topicName,
  successMessage,
  getSessionId,
  chatId,
  token,
}: TriggerConfig<TStartRow> & {
  chatId: string;
  token: string;
}) {
  const { data, error } = await startRpc();

  if (error) {
    throw error;
  }

  const row = data?.[0];

  if (!row) {
    throw new Error("No session row returned");
  }

  const sessionId = getSessionId(row);

  try {
    const publisher = createPubSubPublisherFromEnv(topicName);

    const publishSecret = requireEnv("WORKER_PUBLISH_SECRET");

    const jobToken = jwt.sign(buildJwtPayload(row), publishSecret, {
      expiresIn: "20m",
    });

    const payload: TriggerPayload = {
      jobToken,
      timestamp: Date.now(),
    };

    const messageId = await publisher.publish(payload);

    if (!messageId) {
      throw new Error("Failed to publish trigger");
    }

    const approvalMessageId = await persistMessage({
      chatId,
      content: successMessage,
      role: ROLES.USER,
      repo: new MessagesRepository(token),
      type: MESSAGE_TYPES.PLAN,
    });

    return {
      success: true,
      messageId,
      approvalMessageId,
      sessionId,
    };
  } catch (error) {
    console.error("Trigger failed", {
      chatId,
      sessionId,
      message: error instanceof Error ? error.message : String(error),
    });

    try {
      await finishRpc(sessionId);
    } catch (finishErr) {
      console.error("Rollback failed", finishErr);
    }

    throw wrapHttpError(error, "Failed to trigger workflow.");
  }
}
