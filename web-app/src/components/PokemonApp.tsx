import { useCallback, useDeferredValue, useMemo, useState } from "react";

import { LoadStatus, usePokemons } from "../hooks/usePokemons";
import type { TypeName } from "../types/pokemon";
import { Arena } from "./Arena";
import { Filters } from "./Filters";
import { Header } from "./Header";
import { PokemonList } from "./PokemonList";
import { SelectionBar } from "./SelectionBar";

const FIGHTERS_PER_BATTLE = 2;

export function PokemonApp() {
  const { status, pokemons, total, error, retry } = usePokemons();
  const [search, setSearch] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<TypeName[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [inArena, setInArena] = useState(false);

  // Filtering can mount hundreds of cards: let the search field stay responsive while it happens
  const deferredSearch = useDeferredValue(search);

  const visible = useMemo(() => {
    // Names are slugs ("mr-mime"): let "mr mime" match too
    const query = deferredSearch.trim().toLowerCase().replaceAll(" ", "-");

    return pokemons.filter(
      (pokemon) =>
        pokemon.name.includes(query) && selectedTypes.every((type) => pokemon.types.includes(type)),
    );
  }, [pokemons, deferredSearch, selectedTypes]);

  const fighters = useMemo(
    () => selectedIds.flatMap((id) => pokemons.find((pokemon) => pokemon.id === id) ?? []),
    [pokemons, selectedIds],
  );

  const toggleType = (type: TypeName) =>
    setSelectedTypes((current) =>
      current.includes(type) ? current.filter((other) => other !== type) : [...current, type],
    );

  // Picking one more than a battle needs replaces the oldest pick
  const toggleFighter = useCallback(
    (id: number) =>
      setSelectedIds((current) =>
        current.includes(id)
          ? current.filter((other) => other !== id)
          : [...current, id].slice(-FIGHTERS_PER_BATTLE),
      ),
    [],
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      {/* Behind the arena, the list must not be reachable with the keyboard: picking would restart the battle */}
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
