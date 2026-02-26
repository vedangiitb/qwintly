// lib/redis.ts
import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL_GEN_EVENTS!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN_GEN_EVENTS!,
});
