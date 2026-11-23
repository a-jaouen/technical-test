import { memo } from "react";

import type { PokemonSummary } from "../types/pokemon";
import { label } from "../utils/pokemon";
import { TypeBadge } from "./TypeBadge";

interface CardProps {
  pokemon: PokemonSummary;
  selected: boolean;
  onToggle: (id: number) => void;
}

/** Memoised: typing in the search bar or picking a fighter must not re-render 898 cards */
export const Card = memo(function Card({ pokemon, selected, onToggle }: CardProps) {
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
      <div className="flex flex-wrap justify-center gap-1">
        {pokemon.types.map((type) => (
          <TypeBadge key={type} type={type} />
        ))}
      </div>
      <dl className="w-full text-sm">
        <Stat name="HP" value={stats.HP} />
        <Stat name="Attack" value={stats.attack} />
        <Stat name="Defense" value={stats.defense} />
        <Stat name="Speed" value={stats.speed} />
      </dl>
    </button>
  );
});

function Stat({ name, value }: { name: string; value: number }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-slate-500 dark:text-slate-400">{name}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
