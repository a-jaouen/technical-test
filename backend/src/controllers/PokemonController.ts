import { type Request, type Response, Router } from "express";

import { fetchPokemon } from "../services/pokeapi.ts";

const PokemonController = Router();

export interface PokemonType {
  name: string;
  image: string;
}

export interface StatBlock {
  HP: number;
  attack: number;
  defense: number;
  special_attack: number;
  special_defense: number;
  speed: number;
}

export type DamageRelation =
  | "neutral"
  | "resistant"
  | "twice_resistant"
  | "vulnerable"
  | "twice_vulnerable"
  | "immune";

export interface Resistance {
  name: string;
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
  apiPreEvolution: string | "none";
  apiResistancesWithAbilities: Resistance[];
}

/**
 * Return a pokemon
 * @openapi
 * /pokemons/{id}:
 *   get:
 *     tags: [Pokemons]
 *     summary: Get a Pokémon
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Pokédex id or slug
 *         schema: { type: string }
 *         examples:
 *           id: { value: "25" }
 *           slug: { value: pikachu }
 *     responses:
 *       200:
 *         description: The Pokémon
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pokemon: { $ref: "#/components/schemas/Pokemon" }
 * components:
 *   schemas:
 *     Resistance:
 *       type: object
 *       properties:
 *         name: { type: string, example: ground }
 *         damage_multiplier: { type: number, example: 2 }
 *         damage_relation:
 *           type: string
 *           enum: [neutral, resistant, twice_resistant, vulnerable, twice_vulnerable, immune]
 *     Pokemon:
 *       type: object
 *       properties:
 *         id: { type: integer, example: 25 }
 *         pokedexId: { type: integer, example: 25 }
 *         name: { type: string, example: pikachu }
 *         slug: { type: string, example: pikachu }
 *         image: { type: string, format: uri }
 *         sprite: { type: string, format: uri }
 *         stats:
 *           type: object
 *           properties:
 *             HP: { type: integer, example: 35 }
 *             attack: { type: integer, example: 55 }
 *             defense: { type: integer, example: 40 }
 *             special_attack: { type: integer, example: 50 }
 *             special_defense: { type: integer, example: 50 }
 *             speed: { type: integer, example: 90 }
 *         apiTypes:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name: { type: string, example: electric }
 *               image: { type: string, format: uri }
 *         apiGeneration: { type: integer, example: 1 }
 *         apiResistances:
 *           type: array
 *           items: { $ref: "#/components/schemas/Resistance" }
 *         resistanceModifyingAbilitiesForApi:
 *           type: object
 *           properties:
 *             name: { type: string, example: static }
 *             slug: { type: string, example: static }
 *         apiEvolutions:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name: { type: string, example: raichu }
 *               pokedexId: { type: integer, example: 26 }
 *         apiPreEvolution: { type: string, example: pichu, description: "`none` when there is no pre-evolution" }
 *         apiResistancesWithAbilities:
 *           type: array
 *           items: { $ref: "#/components/schemas/Resistance" }
 */
PokemonController.get("/:id", async (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;

  const pokemon = await fetchPokemon(id);

  return res.status(200).send({ pokemon });
});

export { PokemonController };
