import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { type Request, type Response, Router } from "express";
import Joi from "joi";

import { fetchPokemonMarkdown } from "../services/markdown.ts";

const ContentController = Router();

const POKEMON_COUNT = 898;
const EXPORT_FOLDER = path.resolve("pokemons-ru");
const EXPORT_CONCURRENCY = 10;

const pokemonIdSchema = Joi.number().integer().min(1).max(POKEMON_COUNT).required();

/**
 * Save all pokemon as markdown in the pokemons-ru folder
 * @openapi
 * /contents/all:
 *   get:
 *     tags: [Contents]
 *     summary: Export the 898 Pokémon as Markdown files
 *     description: Writes one Markdown file per Pokémon into the local `pokemons-ru` folder.
 *     responses:
 *       200:
 *         description: Every Pokémon was exported
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/ExportResult" }
 *       502:
 *         description: Some Pokémon could not be fetched from PokeAPI, their ids are in `failed`
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/ExportResult" }
 * components:
 *   schemas:
 *     ExportResult:
 *       type: object
 *       properties:
 *         folder: { type: string, example: /app/pokemons-ru }
 *         exported: { type: integer, example: 898 }
 *         failed: { type: array, items: { type: integer } }
 *     Error:
 *       type: object
 *       properties:
 *         error: { type: string }
 */
ContentController.get("/all", async (_req: Request, res: Response) => {
  await mkdir(EXPORT_FOLDER, { recursive: true });

  const pending = Array.from({ length: POKEMON_COUNT }, (_, index) => index + 1);
  const failed: number[] = [];

  // A few workers share the queue, so PokeAPI only sees a handful of requests at a time
  const worker = async () => {
    for (let id = pending.shift(); id !== undefined; id = pending.shift()) {
      try {
        const { filename, content } = await fetchPokemonMarkdown(id);
        await writeFile(path.join(EXPORT_FOLDER, filename), content);
      } catch {
        failed.push(id);
      }
    }
  };
  await Promise.all(Array.from({ length: EXPORT_CONCURRENCY }, worker));

  return res.status(failed.length ? 502 : 200).send({
    folder: EXPORT_FOLDER,
    exported: POKEMON_COUNT - failed.length,
    failed: failed.sort((a, b) => a - b),
  });
});

/**
 * Return a pokemon as markdown
 * @openapi
 * /contents/{pokemonId}:
 *   get:
 *     tags: [Contents]
 *     summary: Download a Pokémon as a Markdown file
 *     parameters:
 *       - name: pokemonId
 *         in: path
 *         required: true
 *         description: Pokédex id
 *         schema: { type: integer, minimum: 1, maximum: 898, example: 25 }
 *     responses:
 *       200:
 *         description: The Markdown file, sent as an attachment (e.g. `25-pikachu.md`)
 *         content:
 *           text/markdown:
 *             schema: { type: string }
 *       400:
 *         description: The id is not an integer between 1 and 898
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/Error" }
 */
ContentController.get("/:pokemonId", async (req: Request, res: Response) => {
  const { error, value: pokemonId } = pokemonIdSchema.validate(req.params.pokemonId);
  if (error) return res.status(400).send({ error: error.message });

  const { filename, content } = await fetchPokemonMarkdown(pokemonId);

  return res.attachment(filename).type("text/markdown").send(content);
});

export { ContentController };
