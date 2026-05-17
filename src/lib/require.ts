import { createHttpError } from "@/lib/httpError";

export function requireNonEmptyString(
  value: unknown,
  fieldName: string,
  statusCode = 400,
): string {
  if (typeof value !== "string") {
    throw createHttpError(statusCode, `Missing or invalid ${fieldName}`);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw createHttpError(statusCode, `Missing or invalid ${fieldName}`);
  }

  return trimmed;
}

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw createHttpError(500, `Missing required env var: ${name}`);
  }
  return value;
}

