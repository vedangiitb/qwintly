export type HttpError = Error & { statusCode?: number; status?: number };

export function createHttpError(statusCode: number, message: string): HttpError {
  const error = new Error(message) as HttpError;
  error.statusCode = statusCode;
  return error;
}

// Backwards-compatible alias used across the codebase.
export function httpError(message: string, statusCode = 400): HttpError {
  return createHttpError(statusCode, message);
}

export function wrapHttpError(
  error: unknown,
  fallbackMessage: string,
): HttpError {
  const candidate = error as HttpError;
  const message =
    (error instanceof Error && error.message) ||
    candidate?.message ||
    fallbackMessage;

  const wrapped = new Error(message) as HttpError;

  const status = candidate?.statusCode ?? candidate?.status;
  if (typeof status === "number") {
    wrapped.statusCode = status;
  }

  return wrapped;
}
