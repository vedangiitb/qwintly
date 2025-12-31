// lib/mq.ts
import { PubSub } from "@google-cloud/pubsub";

const projectId = process.env.GCP_PROJECT_ID!;
const credentials = JSON.parse(
  Buffer.from(process.env.GCP_SERVICE_ACCOUNT_KEY_BASE64!, "base64").toString()
);

const pubsub = new PubSub({
  projectId,
  credentials,
});

const TOPIC_NAME = process.env.GCP_PUBSUB_TOPIC || "website-generation";

export async function publishWebsiteGeneration({
  chatId,
  tasks,
  newInfo,
}: {
  chatId?: string;
  tasks: any;
  newInfo: any;
}) {
  const payload = {
    chatId,
    tasks,
    newInfo,
    timestamp: Date.now(),
  };

  try {
    const messageId = await pubsub.topic(TOPIC_NAME).publishMessage({
      data: Buffer.from(JSON.stringify(payload)),
    });

    console.log("Sent message to Pub/Sub:", messageId);
    return { success: true, messageId };
  } catch (err) {
    console.error("Pub/Sub publish failed:", err);
    return { success: false, error: err };
  }
}
