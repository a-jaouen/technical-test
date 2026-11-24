import type { PokemonSummary } from "../types/pokemon";
import { PokemonCard } from "./PokemonCard";

interface PokemonListProps {
  pokemons: PokemonSummary[];
  selectedIds: number[];
  onToggle: (id: number) => void;
}

/**
 * Grid of pokemon cards
 * @param props.pokemons - Pokemon shown
 * @param props.selectedIds - Ids of the picked pokemon
 * @param props.onToggle - Called with the id of the pokemon clicked
 */
export function PokemonList({ pokemons, selectedIds, onToggle }: PokemonListProps) {
  if (pokemons.length === 0) {
    return <p className="py-10 text-center">No Pokémon matches your search.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-[repeat(auto-fill,minmax(170px,1fr))] sm:gap-3">
      {pokemons.map((pokemon) => (
        <PokemonCard
          key={pokemon.id}
          pokemon={pokemon}
          selected={selectedIds.includes(pokemon.id)}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}
