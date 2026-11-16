export function el(tag, className = "", ...children) {
    const node = document.createElement(tag);
    if (className)
        node.className = className;
    node.append(...children);
    return node;
}
const numberFormat = new Intl.NumberFormat("ru-RU");
function renderCard(country, onSelect) {
    const flag = el("img", "card__flag");
    flag.src = country.flag;
    flag.alt = `Флаг: ${country.name}`;
    flag.loading = "lazy";
    const body = el("div", "card__body", el("h2", "card__title", country.name), el("p", "card__line", `Столица: ${country.capital ?? "—"}`), el("p", "card__line", `Регион: ${country.region || "—"}`), el("p", "card__line", `Население: ${numberFormat.format(country.population)}`));
    const button = el("button", "card", flag, body);
    button.type = "button";
    button.addEventListener("click", () => onSelect(country));
    return el("li", "cards__item", button);
}
function buildState(state, handlers) {
    switch (state.status) {
        case "idle":
            return [];
        case "loading":
            return [el("p", "status status--loading", "Загрузка…")];
        case "empty":
            return [
                el("p", "status status--empty", `Ничего не найдено по запросу «${state.query}».`),
            ];
        case "error": {
            const retry = el("button", "button", "Повторить");
            retry.type = "button";
            retry.addEventListener("click", handlers.onRetry);
            return [
                el("div", "status status--error", el("p", "", state.message), retry),
            ];
        }
        case "success":
            return [
                el("ul", "cards", ...state.countries.map((country) => renderCard(country, handlers.onSelect))),
            ];
    }
}
export function renderState(container, state, handlers) {
    container.replaceChildren(...buildState(state, handlers));
}
function addRow(list, label, value) {
    list.append(el("dt", "", label), el("dd", "", value || "—"));
}
export function renderDetails(container, country, onClose) {
    const list = el("dl", "details__list");
    addRow(list, "Родное название", country.nativeName);
    addRow(list, "Столица", country.capital ?? "");
    addRow(list, "Регион", [country.region, country.subregion].filter(Boolean).join(", "));
    addRow(list, "Население", numberFormat.format(country.population));
    addRow(list, "Площадь", country.area === null ? "" : `${numberFormat.format(country.area)} км²`);
    addRow(list, "Языки", country.languages.join(", "));
    addRow(list, "Валюта", country.currencies.join(", "));
    addRow(list, "Границы", country.borders.join(", "));
    const close = el("button", "button", "Закрыть");
    close.type = "button";
    close.addEventListener("click", onClose);
    container.replaceChildren(el("h2", "details__title", country.name), list, close);
    container.hidden = false;
}
