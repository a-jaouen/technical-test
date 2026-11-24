import { type Request, type Response, Router } from "express";

import { pageSchema, pokemonIdSchema, validate } from "../schemas.ts";
import { fetchPokemon, fetchPokemonPage } from "../services/pokeapi.ts";

const PokemonController = Router();

/**
 * Return a page of pokemon
 * @openapi
 * /pokemons:
 *   get:
 *     tags: [Pokemons]
 *     summary: List the Pokémon, page by page
 *     description: Light summaries for the grid, in Pokédex order. Read `total` to know when the last page is reached.
 *     parameters:
 *       - $ref: "#/components/parameters/Limit"
 *       - $ref: "#/components/parameters/Offset"
 *     responses:
 *       200:
 *         description: One page of Pokémon
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/PokemonPage" }
 *       400: { $ref: "#/components/responses/BadRequest" }
 *       502: { $ref: "#/components/responses/BadGateway" }
 */
PokemonController.get("/", async (req: Request, res: Response) => {
  const { offset, limit } = validate(pageSchema, req.query);
  const page = await fetchPokemonPage(offset, limit);

  return res.status(200).send(page);
});

/**
 * Return a pokemon
 * @openapi
 * /pokemons/{id}:
 *   get:
 *     tags: [Pokemons]
 *     summary: Get a Pokémon
 *     parameters:
 *       - $ref: "#/components/parameters/PokemonId"
 *     responses:
 *       200:
 *         description: The Pokémon
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pokemon: { $ref: "#/components/schemas/Pokemon" }
 *       400: { $ref: "#/components/responses/BadRequest" }
 *       502: { $ref: "#/components/responses/BadGateway" }
 */
PokemonController.get("/:id", async (req: Request, res: Response) => {
  const id = validate(pokemonIdSchema, req.params.id);
  const pokemon = await fetchPokemon(id);

  return res.status(200).send({ pokemon });
});

export { PokemonController };
