import type { PokemonSummary } from "../types/pokemon";
import { label } from "../utils/pokemon";
import { TypeBadges } from "./TypeBadges";

interface PokemonCardProps {
  pokemon: PokemonSummary;
  selected: boolean;
  onToggle: (id: number) => void;
}

/**
 * Card of a pokemon, clicked to pick it as a fighter
 * @param props.pokemon - Pokemon shown
 * @param props.selected - Whether the pokemon is picked
 * @param props.onToggle - Called with the pokemon id when the card is clicked
 */
export function PokemonCard({ pokemon, selected, onToggle }: PokemonCardProps) {
  const { stats } = pokemon;

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onToggle(pokemon.id)}
      className={`flex min-w-0 flex-col items-center gap-2 rounded-lg border-2 bg-white p-2 text-left hover:border-amber-400 sm:p-3 dark:bg-slate-800 ${
        selected ? "border-amber-400 ring-2 ring-amber-400" : ""
      }`}
    >
      <div className="flex w-full items-baseline justify-between gap-2">
        <span className="truncate font-semibold">{label(pokemon.name)}</span>
        <span className="text-xs text-slate-500 dark:text-slate-400">#{pokemon.id}</span>
      </div>
      <img
        src={pokemon.image}
        alt=""
        loading="lazy"
        width={120}
        height={120}
        className="aspect-square h-auto w-full max-w-30"
      />
      <TypeBadges types={pokemon.types} />
      <dl className="w-full text-sm">
        <Stat name="HP" value={stats.HP} />
        <Stat name="Attack" value={stats.attack} />
        <Stat name="Defense" value={stats.defense} />
        <Stat name="Speed" value={stats.speed} />
      </dl>
    </button>
  );
}

/**
 * One line of the stats of a card
 * @param props.name - Name of the stat
 * @param props.value - Value of the stat
 */
function Stat({ name, value }: { name: string; value: number }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-slate-500 dark:text-slate-400">{name}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
