import { createSearchController } from "./core/searchController.js";
import { searchCountries } from "./core/searchCountries.js";
import { el, renderDetails, renderState } from "./ui/render.js";
const input = el("input", "search");
input.type = "search";
input.placeholder = "Введите название страны…";
input.autocomplete = "off";
input.setAttribute("aria-label", "Название страны");
const results = el("section", "results");
results.setAttribute("aria-live", "polite");
const details = el("section", "details");
details.hidden = true;
document.body.append(el("main", "app", el("h1", "title", "Поиск стран"), input, results, details));
const controller = createSearchController({
    search: searchCountries,
    onState: (state) => {
        details.hidden = true;
        renderState(results, state, {
            onRetry: () => controller.retry(),
            onSelect: (country) => renderDetails(details, country, () => {
                details.hidden = true;
            }),
        });
    },
});
input.addEventListener("input", () => controller.input(input.value));
