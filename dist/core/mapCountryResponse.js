function formatCurrency({ name, symbol }) {
    return symbol ? `${name} (${symbol})` : name;
}
export function mapCountryResponse(raw) {
    return {
        code: raw.alpha3Code ?? raw.name,
        name: raw.name,
        nativeName: raw.nativeName ?? raw.name,
        flag: raw.flags?.svg ?? raw.flags?.png ?? "",
        capital: raw.capital ?? null,
        region: raw.region ?? "",
        subregion: raw.subregion ?? "",
        population: raw.population ?? 0,
        area: raw.area ?? null,
        languages: (raw.languages ?? []).map((language) => language.name),
        currencies: (raw.currencies ?? []).map(formatCurrency),
        borders: raw.borders ?? [],
    };
}
