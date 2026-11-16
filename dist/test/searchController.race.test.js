import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSearchController } from "../core/searchController.js";
import { searchCountries } from "../core/searchCountries.js";
import { createControllableFetch, jsonResponse } from "./helpers/fetchMock.js";
import { spain } from "./fixtures/spain.js";
const DELAY = 300;
function setup() {
    const { fetchMock, requests } = createControllableFetch();
    vi.stubGlobal("fetch", fetchMock);
    const states = [];
    const controller = createSearchController({
        search: searchCountries,
        onState: (state) => states.push(state),
        delay: DELAY,
    });
    const last = () => states[states.length - 1];
    const flush = () => vi.advanceTimersByTimeAsync(0);
    return { requests, states, controller, last, flush };
}
describe("гонка устаревших ответов", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });
    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });
    it("показывает только результат последнего запроса, даже если старый ответ пришёл позже", async () => {
        const { requests, states, controller, last, flush } = setup();
        controller.input("sp");
        await vi.advanceTimersByTimeAsync(DELAY);
        controller.input("spain");
        await vi.advanceTimersByTimeAsync(DELAY);
        expect(requests).toHaveLength(2);
        expect(requests[0].signal.aborted).toBe(true);
        expect(requests[1].signal.aborted).toBe(false);
        requests[1].respond(jsonResponse([spain]));
        await flush();
        requests[0].respond(jsonResponse([{ ...spain, name: "STALE" }]));
        await flush();
        expect(last()).toMatchObject({ status: "success", query: "spain" });
        expect(JSON.stringify(states)).not.toContain("STALE");
        expect(states.some((state) => state.status === "error")).toBe(false);
    });
    it("отменяет активный запрос при каждом вводе, не дожидаясь debounce", async () => {
        const { requests, controller } = setup();
        controller.input("sp");
        await vi.advanceTimersByTimeAsync(DELAY);
        controller.input("spa");
        expect(requests).toHaveLength(1);
        expect(requests[0].signal.aborted).toBe(true);
    });
    it("очистка поля отменяет запрос и не создаёт новых", async () => {
        const { requests, controller, last } = setup();
        controller.input("sp");
        await vi.advanceTimersByTimeAsync(DELAY);
        controller.input("");
        await vi.advanceTimersByTimeAsync(DELAY * 2);
        expect(requests).toHaveLength(1);
        expect(requests[0].signal.aborted).toBe(true);
        expect(last()).toEqual({ status: "idle" });
    });
    it("404 даёт состояние empty, а не error", async () => {
        const { requests, controller, last, flush } = setup();
        controller.input("zzz");
        await vi.advanceTimersByTimeAsync(DELAY);
        requests[0].respond(jsonResponse([], 404));
        await flush();
        expect(last()).toEqual({ status: "empty", query: "zzz" });
    });
    it("реальная ошибка даёт error, а «Повторить» повторяет последний запрос", async () => {
        const { requests, controller, last, flush } = setup();
        controller.input("spain");
        await vi.advanceTimersByTimeAsync(DELAY);
        requests[0].respond(jsonResponse({}, 500));
        await flush();
        expect(last()).toMatchObject({ status: "error", kind: "http" });
        controller.retry();
        await flush();
        expect(requests).toHaveLength(2);
        expect(requests[1].url).toBe("https://countries.dev/name/spain");
    });
});
