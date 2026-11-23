import Joi from "joi";

import { POKEMON_COUNT } from "./services/pokeapi.ts";

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const MIN_FIGHTERS = 2;
export const MAX_FIGHTERS = 6;

/** A pokedex id: only the 898 pokemon of generations 1 to 8 are served */
export const pokemonIdSchema = Joi.number().integer().min(1).max(POKEMON_COUNT).required();

/** Query string of a paginated list */
export const pageSchema = Joi.object({
  limit: Joi.number().integer().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
  offset: Joi.number().integer().min(0).default(0),
});

/** Body of a battle request */
export const battleSchema = Joi.object({
  pokemonIds: Joi.array()
    .items(pokemonIdSchema)
    .min(MIN_FIGHTERS)
    .max(MAX_FIGHTERS)
    .unique()
    .required(),
});
