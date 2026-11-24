import Joi from "joi";

import { POKEMON_COUNT } from "./services/pokeapi.ts";
import type { BattleRequest, BattleTeam } from "./types/pokemon.ts";
import { HttpError } from "./utils/HttpError.ts";

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const TEAMS_PER_BATTLE = 2;
/** Raise it to let several pokemon fight side by side */
export const POKEMONS_PER_TEAM = 1;

/** A pokedex id: only the 898 pokemon of generations 1 to 8 are served */
export const pokemonIdSchema = Joi.number().integer().min(1).max(POKEMON_COUNT);

/** Query string of a paginated list */
export const pageSchema = Joi.object<{ limit: number; offset: number }>({
  limit: Joi.number().integer().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
  offset: Joi.number().integer().min(0).default(0),
});

const teamSchema = Joi.object<BattleTeam>({
  pokemonIds: Joi.array().items(pokemonIdSchema).length(POKEMONS_PER_TEAM).unique().required(),
});

const sharePokemon = (a: BattleTeam, b: BattleTeam): boolean =>
  a.pokemonIds.some((id) => b.pokemonIds.includes(id));

/** Body of a battle request: a pokemon fights only once, whatever its team */
export const battleSchema = Joi.object<BattleRequest>({
  teams: Joi.array().items(teamSchema).length(TEAMS_PER_BATTLE).unique(sharePokemon).required(),
});

/**
 * Check `input` against `schema` and return its validated value (numbers parsed, defaults applied).
 * A missing or invalid input is answered with a 400 saying what is wrong.
 */
export function validate<T>(schema: Joi.Schema<T>, input: unknown): T {
  const { error, value } = schema.required().validate(input);
  if (error) throw new HttpError(400, error.message);

  return value;
}
