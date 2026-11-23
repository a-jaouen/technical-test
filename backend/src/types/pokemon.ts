/**
 * Pokemon types shared by the backend and the web-app.
 *
 * This file exists in both projects, as `backend/src/types/pokemon.ts` and
 * `web-app/src/types/pokemon.ts`: change one, then copy it over the other.
 */

export enum TypeName {
  Normal = "normal",
  Fire = "fire",
  Water = "water",
  Electric = "electric",
  Grass = "grass",
  Ice = "ice",
  Fighting = "fighting",
  Poison = "poison",
  Ground = "ground",
  Flying = "flying",
  Psychic = "psychic",
  Bug = "bug",
  Rock = "rock",
  Ghost = "ghost",
  Dragon = "dragon",
  Dark = "dark",
  Steel = "steel",
  Fairy = "fairy",
}

/** How much damage a pokemon takes from an attacking type */
export enum DamageRelation {
  Immune = "immune",
  TwiceResistant = "twice_resistant",
  Resistant = "resistant",
  Neutral = "neutral",
  Vulnerable = "vulnerable",
  TwiceVulnerable = "twice_vulnerable",
}

/** Physical moves use Attack against Defense, special moves use Special Attack against Special Defense */
export enum MoveCategory {
  Physical = "physical",
  Special = "special",
}

export interface StatBlock {
  HP: number;
  attack: number;
  defense: number;
  special_attack: number;
  special_defense: number;
  speed: number;
}

export interface PokemonType {
  name: TypeName;
  image: string;
}

export interface Resistance {
  /** The attacking type */
  name: TypeName;
  damage_multiplier: number;
  damage_relation: DamageRelation;
}

export interface Ability {
  name: string;
  slug: string;
}

export interface Evolution {
  name: string;
  pokedexId: number;
}

export interface Move {
  name: string;
  type: TypeName;
  category: MoveCategory;
  power: number;
  /** `null` when the move never misses */
  accuracy: number | null;
}

/** What the grid needs, without the per-pokemon lookups (species, evolutions, moves) */
export interface PokemonSummary {
  id: number;
  name: string;
  image: string;
  types: TypeName[];
  stats: StatBlock;
}

/** One page of the pokemon list */
export interface PokemonPage {
  pokemons: PokemonSummary[];
  /** How many pokemon exist in total, across all pages */
  total: number;
  limit: number;
  offset: number;
}

export interface Pokemon {
  id: number;
  pokedexId: number;
  name: string;
  image: string;
  sprite: string;
  slug: string;
  stats: StatBlock;
  apiTypes: PokemonType[];
  apiGeneration: number;
  apiResistances: Resistance[];
  resistanceModifyingAbilitiesForApi: Ability;
  apiEvolutions: Evolution[];
  /** Name of the pokemon it evolves from, `none` when there is none */
  apiPreEvolution: string;
  apiResistancesWithAbilities: Resistance[];
  apiMoves: Move[];
}
