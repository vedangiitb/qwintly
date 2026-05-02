export type HttpError = Error & { statusCode?: number; status?: number };

export function httpError(message: string, statusCode: number): HttpError {
  const err = new Error(message) as HttpError;
  err.statusCode = statusCode;
  return err;
}

