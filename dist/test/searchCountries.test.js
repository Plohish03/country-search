import { afterEach, describe, expect, it, vi } from "vitest";
import { HttpError } from "../core/errors.js";
import { searchCountries } from "../core/searchCountries.js";
import { createControllableFetch, jsonResponse, } from "../test/helpers/fetchMock.js";
import { spain } from "./fixtures/spain.js";
async function rejection(promise) {
    try {
        await promise;
    }
    catch (error) {
        return error;
    }
    throw new Error("promise не был отклонён");
}
afterEach(() => {
    vi.unstubAllGlobals();
});
describe("searchCountries", () => {
    it("возвращает преобразованные страны при 200", async () => {
        const fetchMock = vi.fn().mockResolvedValue(jsonResponse([spain]));
        vi.stubGlobal("fetch", fetchMock);
        const result = await searchCountries("spain", new AbortController().signal);
        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({ name: "Spain", capital: "Madrid" });
        expect(fetchMock).toHaveBeenCalledWith("https://countries.dev/name/spain", expect.objectContaining({ signal: expect.any(AbortSignal) }));
    });
    it("кодирует строку запроса в URL", async () => {
        const fetchMock = vi.fn().mockResolvedValue(jsonResponse([]));
        vi.stubGlobal("fetch", fetchMock);
        await searchCountries("côte d'ivoire", new AbortController().signal);
        expect(fetchMock.mock.calls[0][0]).toBe(`https://countries.dev/name/${encodeURIComponent("côte d'ivoire")}`);
    });
    it("404 — это пустой результат, а не ошибка", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse([], 404)));
        const result = await searchCountries("zzz", new AbortController().signal);
        expect(result).toEqual([]);
    });
    it("на 500 бросает HttpError со статусом", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({}, 500)));
        const error = await rejection(searchCountries("spain", new AbortController().signal));
        expect(error).toBeInstanceOf(HttpError);
        expect(error.status).toBe(500);
    });
    it("при отмене сигнала отклоняется с AbortError", async () => {
        const { fetchMock } = createControllableFetch();
        vi.stubGlobal("fetch", fetchMock);
        const controller = new AbortController();
        const promise = searchCountries("sp", controller.signal);
        controller.abort();
        const error = await rejection(promise);
        expect(error.name).toBe("AbortError");
    });
    it("при таймауте отклоняется с TimeoutError, не AbortError", async () => {
        const { fetchMock } = createControllableFetch();
        vi.stubGlobal("fetch", fetchMock);
        const error = await rejection(searchCountries("sp", new AbortController().signal, 20));
        expect(error.name).toBe("TimeoutError");
    });
    it("пробрасывает сетевую ошибку fetch", async () => {
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
        const error = await rejection(searchCountries("spain", new AbortController().signal));
        expect(error).toBeInstanceOf(TypeError);
    });
});
