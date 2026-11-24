import Joi from "joi";

import { POKEMON_COUNT } from "./services/pokeapi.ts";
import { HttpError } from "./utils/HttpError.ts";

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const MIN_FIGHTERS = 2;
export const MAX_FIGHTERS = 6;

/** A pokedex id: only the 898 pokemon of generations 1 to 8 are served */
export const pokemonIdSchema = Joi.number().integer().min(1).max(POKEMON_COUNT);

/** Query string of a paginated list */
export const pageSchema = Joi.object<{ limit: number; offset: number }>({
  limit: Joi.number().integer().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
  offset: Joi.number().integer().min(0).default(0),
});

/** Body of a battle request */
export const battleSchema = Joi.object<{ pokemonIds: number[] }>({
  pokemonIds: Joi.array()
    .items(pokemonIdSchema)
    .min(MIN_FIGHTERS)
    .max(MAX_FIGHTERS)
    .unique()
    .required(),
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
