export class ChatUiServiceError extends Error {
  public readonly service: string;
  public override readonly cause: unknown;

  constructor(params: { service: string; message: string; cause?: unknown }) {
    super(params.message);
    this.name = "ChatUiServiceError";
    this.service = params.service;
    this.cause = params.cause;
  }
}

export const toErrorMessage = (error: unknown, fallbackMessage: string): string => {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
};

export const ensureNonEmptyString = (value: unknown, fieldName: string): string => {
  const trimmed = typeof value === "string" ? value.trim() : "";

  if (!trimmed) {
    throw new Error(`Missing or invalid ${fieldName}`);
  }

  return trimmed;
};
