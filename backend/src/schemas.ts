import Joi from "joi";

import { POKEMON_COUNT } from "./services/pokeapi.ts";
import {
  type BattleRequest,
  type BattleTeam,
  MAX_PAGE_SIZE,
  POKEMONS_PER_TEAM,
  TEAMS_PER_BATTLE,
} from "./types/pokemon.ts";
import { HttpError } from "./utils/HttpError.ts";

export const DEFAULT_PAGE_SIZE = 20;

export const pokemonIdSchema = Joi.number().integer().min(1).max(POKEMON_COUNT);

export const pageSchema = Joi.object<{ limit: number; offset: number }>({
  limit: Joi.number().integer().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
  offset: Joi.number().integer().min(0).default(0),
});

const teamSchema = Joi.object<BattleTeam>({
  pokemonIds: Joi.array().items(pokemonIdSchema).length(POKEMONS_PER_TEAM).unique().required(),
});

/**
 * Tell whether two teams have a pokemon in common
 * @param a - First team
 * @param b - Second team
 */
const sharePokemon = (a: BattleTeam, b: BattleTeam): boolean =>
  a.pokemonIds.some((id) => b.pokemonIds.includes(id));

export const battleSchema = Joi.object<BattleRequest>({
  teams: Joi.array().items(teamSchema).length(TEAMS_PER_BATTLE).unique(sharePokemon).required(),
});

/**
 * Return the validated value of an input (numbers parsed, defaults applied), or throw a 400 saying what is wrong
 * @param schema - Joi schema the input must match
 * @param input - Value received from the client
 */
export function validate<T>(schema: Joi.Schema<T>, input: unknown): T {
  const { error, value } = schema.required().validate(input);
  if (error) throw new HttpError(400, error.message);

  return value;
}
