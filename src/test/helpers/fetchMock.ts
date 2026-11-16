import { vi } from "vitest";

export interface PendingRequest {
  url: string;
  signal: AbortSignal;
  respond: (response: Response) => void;
}

export function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as unknown as Response;
}

/** fetch, который висит, пока тест не ответит, и отклоняется при abort(). */
export function createControllableFetch() {
  const requests: PendingRequest[] = [];

  const fetchMock = vi.fn(
    (input: string | URL | Request, init?: RequestInit) =>
      new Promise<Response>((resolve, reject) => {
        const signal = init?.signal ?? new AbortController().signal;
        if (signal.aborted) {
          reject(signal.reason);
          return;
        }
        signal.addEventListener("abort", () => reject(signal.reason), {
          once: true,
        });
        requests.push({ url: String(input), signal, respond: resolve });
      }),
  );

  return { fetchMock, requests };
}
