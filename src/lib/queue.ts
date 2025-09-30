import { Queue } from "bullmq";
import { connection } from "./redis";

export type EmailJobData = {
  email: string;
  userId: string;
};

const emailQueue = new Queue<EmailJobData>("MailQueue", { connection });

export async function enqueueEmail(data: EmailJobData) {
  await emailQueue.add("sendVerification", data);
}
