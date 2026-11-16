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

export function createSearchController(
  _options: SearchControllerOptions,
): SearchController {
  return {
    input(_value: string): void {},
    retry(): void {},
  };
}
