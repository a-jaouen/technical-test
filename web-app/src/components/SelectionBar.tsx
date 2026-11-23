import type { PokemonSummary } from "../types/pokemon";
import { label } from "../utils/pokemon";

interface SelectionBarProps {
  fighters: PokemonSummary[];
  /** How many pokemon a battle needs */
  size: number;
  onClear: () => void;
  onBattle: () => void;
}

/** Bottom bar showing the picked pokemon and the button sending them to the arena */
export function SelectionBar({ fighters, size, onClear, onBattle }: SelectionBarProps) {
  const missing = size - fighters.length;

  return (
    <div className="fixed inset-x-0 bottom-0 z-10 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 border-t bg-white p-3 dark:bg-slate-800">
      {fighters.map((fighter) => (
        <span key={fighter.id} className="flex items-center gap-1 font-medium">
          <img src={fighter.image} alt="" className="size-8" />
          {label(fighter.name)}
        </span>
      ))}
      {missing > 0 && (
        <span className="text-sm text-slate-500 dark:text-slate-400">Pick {missing} more</span>
      )}
      <button type="button" onClick={onClear} className="rounded-md border px-3 py-1.5">
        Clear
      </button>
      <button
        type="button"
        onClick={onBattle}
        disabled={missing > 0}
        className="rounded-md bg-amber-400 px-4 py-1.5 font-semibold text-slate-900 disabled:opacity-40"
      >
        Battle!
      </button>
    </div>
  );
}
