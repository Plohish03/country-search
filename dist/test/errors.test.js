import { describe, expect, it } from "vitest";
import { classifyError, HttpError } from "../core/errors.js";
describe("HttpError", () => {
    it("является Error и хранит статус", () => {
        const error = new HttpError(500);
        expect(error).toBeInstanceOf(Error);
        expect(error.status).toBe(500);
        expect(error.name).toBe("HttpError");
    });
});
describe("classifyError", () => {
    it("AbortError — отмена своего запроса", () => {
        expect(classifyError(new DOMException("x", "AbortError"))).toBe("aborted");
    });
    it("TimeoutError — таймаут, а не отмена", () => {
        expect(classifyError(new DOMException("x", "TimeoutError"))).toBe("timeout");
    });
    it("HttpError — ошибка сервера", () => {
        expect(classifyError(new HttpError(503))).toBe("http");
    });
    it("TypeError от fetch — сетевая ошибка", () => {
        expect(classifyError(new TypeError("Failed to fetch"))).toBe("network");
    });
    it("любое другое значение — сетевая ошибка", () => {
        expect(classifyError("что-то странное")).toBe("network");
    });
});
