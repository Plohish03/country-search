import type { Country } from "./types.js";

export const API_URL = "https://countries.dev/name/";
export const REQUEST_TIMEOUT_MS = 8000;

export async function searchCountries(
  _query: string,
  _signal: AbortSignal,
  _timeoutMs: number = REQUEST_TIMEOUT_MS,
): Promise<Country[]> {
  return [];
}
