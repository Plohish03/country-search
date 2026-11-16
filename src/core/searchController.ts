import { debounce } from "./debounce.js";
import { classifyError, HttpError } from "./errors.js";
import type { ErrorKind } from "./errors.js";
import type { Country } from "./types.js";

export type SearchState =
  | { status: "idle" }
  | { status: "loading"; query: string }
  | { status: "success"; query: string; countries: Country[] }
  | { status: "empty"; query: string }
  | {
      status: "error";
      query: string;
      kind: Exclude<ErrorKind, "aborted">;
      message: string;
    };

export interface SearchControllerOptions {
  search: (query: string, signal: AbortSignal) => Promise<Country[]>;
  onState: (state: SearchState) => void;
  delay?: number;
}

export interface SearchController {
  input: (value: string) => void;
  retry: () => void;
}

export const DEBOUNCE_DELAY_MS = 300;

function describeError(
  kind: Exclude<ErrorKind, "aborted">,
  error: unknown,
): string {
  if (kind === "timeout") return "Сервер слишком долго не отвечает.";
  if (kind === "http" && error instanceof HttpError) {
    return `Сервер вернул ошибку ${error.status}.`;
  }
  return "Не удалось выполнить запрос. Проверьте соединение.";
}

export function createSearchController({
  search,
  onState,
  delay = DEBOUNCE_DELAY_MS,
}: SearchControllerOptions): SearchController {
  let activeRequest: AbortController | undefined;
  let lastQuery = "";

  async function run(query: string): Promise<void> {
    activeRequest?.abort();
    const request = new AbortController();
    activeRequest = request;
    onState({ status: "loading", query });

    try {
      const countries = await search(query, request.signal);
      if (request.signal.aborted) return;
      onState(
        countries.length > 0
          ? { status: "success", query, countries }
          : { status: "empty", query },
      );
    } catch (error) {
      const kind = classifyError(error);
      if (kind === "aborted" || request.signal.aborted) return;
      onState({
        status: "error",
        query,
        kind,
        message: describeError(kind, error),
      });
    }
  }

  const scheduleRun = debounce(() => {
    if (lastQuery !== "") void run(lastQuery);
  }, delay);

  return {
    input(value: string): void {
      lastQuery = value.trim();
      activeRequest?.abort();
      activeRequest = undefined;
      if (lastQuery === "") {
        onState({ status: "idle" });
        return;
      }
      scheduleRun();
    },
    retry(): void {
      if (lastQuery !== "") void run(lastQuery);
    },
  };
}
