import type { TypeName } from "../types/pokemon";
import { label, TYPE_COLORS, TYPES } from "../utils/pokemon";

interface FiltersProps {
  search: string;
  onSearchChange: (search: string) => void;
  selectedTypes: TypeName[];
  onToggleType: (type: TypeName) => void;
  resultCount: number;
}

/**
 * Search bar and type filters, pinned to the top of the screen while the list scrolls
 * @param props.search - Text typed in the search bar
 * @param props.onSearchChange - Called when the text changes
 * @param props.selectedTypes - Types the pokemon must have
 * @param props.onToggleType - Called when a type is clicked
 * @param props.resultCount - How many pokemon match the search and the types
 */
export function Filters({
  search,
  onSearchChange,
  selectedTypes,
  onToggleType,
  resultCount,
}: FiltersProps) {
  return (
    <div className="sticky top-0 z-10 border-b bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-3">
        <div className="flex items-center gap-3">
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by name"
            aria-label="Search a Pokémon by name"
            className="min-w-0 flex-1 rounded-md border bg-white px-3 py-2 sm:max-w-sm dark:bg-slate-800"
          />
          <span className="shrink-0 text-sm text-slate-500 dark:text-slate-400" aria-live="polite">
            {resultCount} Pokémon
          </span>
        </div>
        <div
          className="[scrollbar-none] -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:overflow-visible md:px-0"
          role="group"
          aria-label="Filter by type"
        >
          {TYPES.map((type) => {
            const selected = selectedTypes.includes(type);

            return (
              <button
                key={type}
                type="button"
                aria-pressed={selected}
                onClick={() => onToggleType(type)}
                className="shrink-0 rounded-full border-2 px-3 py-1 text-sm font-medium"
                style={
                  selected
                    ? {
                        backgroundColor: TYPE_COLORS[type],
                        borderColor: TYPE_COLORS[type],
                        color: "white",
                      }
                    : { borderColor: TYPE_COLORS[type] }
                }
              >
                {label(type)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
