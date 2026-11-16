import { describe, expect, it } from "vitest";
import { mapCountryResponse } from "../core/mapCountryResponse.js";
import { spain } from "./fixtures/spain.js";
describe("mapCountryResponse", () => {
    it("преобразует полный ответ в данные карточки", () => {
        expect(mapCountryResponse(spain)).toEqual({
            code: "ESP",
            name: "Spain",
            nativeName: "España",
            flag: "https://flagcdn.com/es.svg",
            capital: "Madrid",
            region: "Europe",
            subregion: "Southern Europe",
            population: 47351567,
            area: 505992,
            languages: ["Spanish"],
            currencies: ["Euro (€)"],
            borders: ["AND", "FRA", "GIB", "PRT", "MAR"],
        });
    });
    it("возвращает capital: null, если столицы нет", () => {
        const { capital: _capital, ...withoutCapital } = spain;
        expect(mapCountryResponse(withoutCapital).capital).toBeNull();
    });
    it("возвращает пустые массивы, если языков, валют и границ нет", () => {
        const result = mapCountryResponse({ name: "Nowhere" });
        expect(result.languages).toEqual([]);
        expect(result.currencies).toEqual([]);
        expect(result.borders).toEqual([]);
    });
    it("берёт png, если svg-флага нет", () => {
        const result = mapCountryResponse({
            ...spain,
            flags: { png: "https://example.com/flag.png" },
        });
        expect(result.flag).toBe("https://example.com/flag.png");
    });
});
