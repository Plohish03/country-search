import { vi } from "vitest";
export function jsonResponse(body, status = 200) {
    return {
        ok: status >= 200 && status < 300,
        status,
        json: () => Promise.resolve(body),
    };
}
/** fetch, который висит, пока тест не ответит, и отклоняется при abort(). */
export function createControllableFetch() {
    const requests = [];
    const fetchMock = vi.fn((input, init) => new Promise((resolve, reject) => {
        const signal = init?.signal ?? new AbortController().signal;
        if (signal.aborted) {
            reject(signal.reason);
            return;
        }
        signal.addEventListener("abort", () => reject(signal.reason), {
            once: true,
        });
        requests.push({ url: String(input), signal, respond: resolve });
    }));
    return { fetchMock, requests };
}
