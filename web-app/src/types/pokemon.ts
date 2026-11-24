/**
 * Pokemon types and API limits shared by the backend and the web-app.
 *
 * This file exists in both projects, as `backend/src/types/pokemon.ts` and
 * `web-app/src/types/pokemon.ts`: change one, then copy it over the other.
 */

export const MAX_PAGE_SIZE = 100;
export const TEAMS_PER_BATTLE = 2;
export const POKEMONS_PER_TEAM = 1;

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

export enum DamageRelation {
  Immune = "immune",
  TwiceResistant = "twice_resistant",
  Resistant = "resistant",
  Neutral = "neutral",
  Vulnerable = "vulnerable",
  TwiceVulnerable = "twice_vulnerable",
}

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
  accuracy: number | null;
}

export interface PokemonSummary {
  id: number;
  name: string;
  image: string;
  types: TypeName[];
  stats: StatBlock;
}

export interface PokemonPage {
  pokemons: PokemonSummary[];
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
  apiPreEvolution: string;
  apiResistancesWithAbilities: Resistance[];
  apiMoves: Move[];
}

export interface BattleTeam {
  pokemonIds: number[];
}

export interface BattleRequest {
  teams: BattleTeam[];
}
