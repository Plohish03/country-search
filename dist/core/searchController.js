import { debounce } from "./debounce.js";
import { classifyError, HttpError } from "./errors.js";
export const DEBOUNCE_DELAY_MS = 300;
function describeError(kind, error) {
    if (kind === "timeout")
        return "Сервер слишком долго не отвечает.";
    if (kind === "http" && error instanceof HttpError) {
        return `Сервер вернул ошибку ${error.status}.`;
    }
    return "Не удалось выполнить запрос. Проверьте соединение.";
}
export function createSearchController({ search, onState, delay = DEBOUNCE_DELAY_MS, }) {
    let activeRequest;
    let lastQuery = "";
    async function run(query) {
        activeRequest?.abort();
        const request = new AbortController();
        activeRequest = request;
        onState({ status: "loading", query });
        try {
            const countries = await search(query, request.signal);
            if (request.signal.aborted)
                return;
            onState(countries.length > 0
                ? { status: "success", query, countries }
                : { status: "empty", query });
        }
        catch (error) {
            const kind = classifyError(error);
            if (kind === "aborted" || request.signal.aborted)
                return;
            onState({
                status: "error",
                query,
                kind,
                message: describeError(kind, error),
            });
        }
    }
    const scheduleRun = debounce(() => {
        if (lastQuery !== "")
            void run(lastQuery);
    }, delay);
    return {
        input(value) {
            lastQuery = value.trim();
            activeRequest?.abort();
            activeRequest = undefined;
            if (lastQuery === "") {
                onState({ status: "idle" });
                return;
            }
            scheduleRun();
        },
        retry() {
            if (lastQuery !== "")
                void run(lastQuery);
        },
    };
}
