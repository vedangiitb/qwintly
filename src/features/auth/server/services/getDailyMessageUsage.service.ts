import { getUTCDateString } from "@/features/chat/server/helpers/rateLimit.helpers";
import { redis } from "@/lib/redis";

const DAILY_MESSAGE_LIMIT = 50;

function coerceCount(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

export async function getDailyMessageUsageService(userId: string) {
  const date = getUTCDateString(); // YYYY-MM-DD (UTC)
  const key = `user:${userId}:messages:${date}`;

  const raw = await redis.get<number | string>(key);
  const count = Math.max(0, coerceCount(raw));

  return {
    date,
    count,
    limit: DAILY_MESSAGE_LIMIT,
    remaining: Math.max(0, DAILY_MESSAGE_LIMIT - count),
  };
}

