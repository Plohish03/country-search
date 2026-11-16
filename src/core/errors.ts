export class HttpError extends Error {
  readonly status: number;

  constructor(status: number) {
    super();
    this.name = "HttpError";
    this.status = status;
  }
}

export type ErrorKind = "aborted" | "timeout" | "http" | "network";

export function classifyError(_error: unknown): ErrorKind {
  return "network";
}
