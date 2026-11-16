export class HttpError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`HTTP error ${status}`);
    this.name = "HttpError";
    this.status = status;
  }
}

export type ErrorKind = "aborted" | "timeout" | "http" | "network";

export function classifyError(error: unknown): ErrorKind {
  if (error instanceof HttpError) return "http";
  if (error instanceof DOMException) {
    if (error.name === "AbortError") return "aborted";
    if (error.name === "TimeoutError") return "timeout";
  }
  return "network";
}
