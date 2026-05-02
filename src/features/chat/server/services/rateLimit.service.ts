import { redis } from "@/lib/redis";
import {
  getSecondsUntilUTCMidnight,
  getUTCDateString,
} from "../helpers/rateLimit.helpers";

export async function checkUserMessageLimit(userId: string) {
  const date = getUTCDateString();
  const key = `user:${userId}:messages:${date}`;

  let count: number;

  count = await redis.incr(key);

  if (count === 1) {
    const ttl = getSecondsUntilUTCMidnight();
    await redis.expire(key, ttl);
  }

  if (count > 50) {
    throw new Error("Daily message limit reached (50)");
  }
  return {
    success: true,
    remaining: 50 - count,
  };
}
