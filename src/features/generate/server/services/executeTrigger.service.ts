import { MessagesRepository } from "@/features/chat/server/repositories/messages.repository";
import { persistMessage } from "@/features/chat/server/services/persistMessage.service";
import { MESSAGE_TYPES, ROLES } from "@/features/chat/types/messages.types";
import { createHttpError, wrapHttpError } from "@/lib/httpError";
import { requireEnv } from "@/lib/require";
import { PubSub } from "@google-cloud/pubsub";
import jwt from "jsonwebtoken";
type StartRpcResult<T> = {
  data: T[] | null;
  error: unknown;
};

type SupabaseRpcErrorShape = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

function isSupabaseRpcErrorShape(
  error: unknown,
): error is SupabaseRpcErrorShape {
  return typeof error === "object" && error !== null;
}

function toStartRpcHttpError(error: unknown) {
  if (!isSupabaseRpcErrorShape(error)) {
    return wrapHttpError(error, "Failed to start workflow.");
  }

  const code = typeof error.code === "string" ? error.code : undefined;
  const message = typeof error.message === "string" ? error.message.trim() : "";
  const normalized = message.toLowerCase();

  if (code === "42501") {
    // insufficient_privilege (Postgres) used for authz failures in our RPCs
    const statusCode = normalized.includes("does not belong") ? 403 : 401;
    return createHttpError(statusCode, message || "Unauthorized");
  }

  if (code === "P0001" || !code) {
    // P0001 = raise_exception, also used for "raise exception '...'" without errcode
    if (normalized === "weekly limit exhausted") {
      return createHttpError(
        429,
        "Weekly limit exhausted. Add an API key (BYOK) or try again next week.",
      );
    }

    if (normalized === "chat not found") {
      return createHttpError(404, "Chat not found");
    }

    if (normalized === "task not found") {
      return createHttpError(404, "Plan task not found");
    }

    if (normalized === "generation session not found") {
      return createHttpError(404, "Generation session not found");
    }

    if (normalized === "generation session has no plan_id") {
      return createHttpError(400, "Generation session is missing plan id");
    }

    if (normalized === "cannot deploy from a deployment session") {
      return createHttpError(400, "Cannot deploy from a deployment session");
    }

    if (normalized === "chat is already generating") {
      return createHttpError(409, "Chat is already generating");
    }

    if (normalized === "chat is already deploying") {
      return createHttpError(409, "Chat is already deploying");
    }

    if (normalized.startsWith("task is not startable")) {
      return createHttpError(409, message || "Task is not startable");
    }

    // Default: treat raised exceptions as a user-facing request problem.
    if (message) {
      return createHttpError(400, message);
    }
  }

  return wrapHttpError(error, "Failed to start workflow.");
}

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
    throw toStartRpcHttpError(error);
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
