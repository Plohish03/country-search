export class HttpError extends Error {
    status;
    constructor(status) {
        super(`HTTP error ${status}`);
        this.name = "HttpError";
        this.status = status;
    }
}
export function classifyError(error) {
    if (error instanceof HttpError)
        return "http";
    if (error instanceof DOMException) {
        if (error.name === "AbortError")
            return "aborted";
        if (error.name === "TimeoutError")
            return "timeout";
    }
    return "network";
}
