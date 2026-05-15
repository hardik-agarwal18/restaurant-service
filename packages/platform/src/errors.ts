export class HttpError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message?: string) {
    super(message ?? code);
    this.status = status;
    this.code = code;
  }
}

export function badRequest(message = "Bad Request") {
  return new HttpError(400, "BAD_REQUEST", message);
}

export function unauthorized(message = "Unauthorized") {
  return new HttpError(401, "UNAUTHORIZED", message);
}

export function forbidden(message = "Forbidden") {
  return new HttpError(403, "FORBIDDEN", message);
}
