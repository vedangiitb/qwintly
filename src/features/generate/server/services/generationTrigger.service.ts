import { PubSub } from "@google-cloud/pubsub";

type GenerationTriggerPayload = {
  chatId: string;
  planId: string;
  requestType: string;
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

export const generationTriggerService = async (
  chatId: string,
  planId: string,
  publisher: GenerationPublisher = defaultPublisher,
): Promise<GenerationTriggerResult> => {
  // TODO: Have a logic to determine if the plan status is pending (P-High)
  // TODO: Have a logic in worker to change the plan status to implementing(P-High)
  // TODO: Replace with a logic to determine if request type is new or resume(P-High)
  const requestType = "new";
  const payload: GenerationTriggerPayload = {
    chatId: chatId,
    planId: planId,
    requestType: requestType,
    timestamp: Date.now(),
  };

  try {
    const messageId = await publisher.publish(payload);
    return { success: true, messageId };
  } catch (error) {
    console.error("Pub/Sub publish failed", { chatId: payload.chatId, error });
    throw new Error("Failed to trigger generation workflow");
  }
};
