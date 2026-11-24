import { useDeferredValue, useState } from "react";

import { LoadStatus, usePokemons } from "../hooks/usePokemons";
import { POKEMONS_PER_TEAM, TEAMS_PER_BATTLE, type TypeName } from "../types/pokemon";
import { Arena } from "./Arena";
import { Filters } from "./Filters";
import { Header } from "./Header";
import { PokemonList } from "./PokemonList";
import { SelectionBar } from "./SelectionBar";

const FIGHTERS_PER_BATTLE = TEAMS_PER_BATTLE * POKEMONS_PER_TEAM;

/**
 * Add an item to a list, or remove it when it is already there
 * @param list - List to change
 * @param item - Item clicked
 */
const toggle = <T,>(list: T[], item: T): T[] =>
  list.includes(item) ? list.filter((other) => other !== item) : [...list, item];

/**
 * The pokemon list with its filters, the picked fighters and the arena
 */
export function PokemonApp() {
  const { status, pokemons, total, error, retry } = usePokemons();
  const [search, setSearch] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<TypeName[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [inArena, setInArena] = useState(false);

  const deferredSearch = useDeferredValue(search);

  const query = deferredSearch.trim().toLowerCase().replaceAll(" ", "-");
  const visible = pokemons.filter(
    (pokemon) =>
      pokemon.name.includes(query) && selectedTypes.every((type) => pokemon.types.includes(type)),
  );

  const fighters = selectedIds.flatMap((id) => pokemons.find((pokemon) => pokemon.id === id) ?? []);

  /**
   * Add a type to the filters, or remove it
   * @param type - Type clicked
   */
  const toggleType = (type: TypeName) => setSelectedTypes((current) => toggle(current, type));

  /**
   * Pick a pokemon as a fighter, or drop it: one pick too many replaces the oldest
   * @param id - Id of the pokemon clicked
   */
  const toggleFighter = (id: number) =>
    setSelectedIds((current) => toggle(current, id).slice(-FIGHTERS_PER_BATTLE));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <div inert={inArena}>
        <Header />
        {pokemons.length > 0 && (
          <Filters
            search={search}
            onSearchChange={setSearch}
            selectedTypes={selectedTypes}
            onToggleType={toggleType}
            resultCount={visible.length}
          />
        )}
        <main className="mx-auto flex max-w-7xl flex-col gap-3 p-4 pb-32 sm:pb-24">
          {status === LoadStatus.Error ? (
            <div role="alert" className="flex flex-wrap items-center gap-3">
              <p>The Pokémon could not be loaded: {error}</p>
              <button type="button" onClick={retry} className="rounded-md border px-3 py-1.5">
                Try again
              </button>
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400" aria-live="polite">
              {status === LoadStatus.Loading
                ? `Loading Pokémon… ${total ? `${pokemons.length} / ${total}` : ""}`
                : "Pick two Pokémon to send them into the arena."}
            </p>
          )}

          {pokemons.length > 0 && (
            <PokemonList pokemons={visible} selectedIds={selectedIds} onToggle={toggleFighter} />
          )}
        </main>

        {fighters.length > 0 && (
          <SelectionBar
            fighters={fighters}
            size={FIGHTERS_PER_BATTLE}
            onClear={() => setSelectedIds([])}
            onBattle={() => setInArena(true)}
          />
        )}
      </div>
      {inArena && <Arena fighters={fighters} onClose={() => setInArena(false)} />}
    </div>
  );
}
