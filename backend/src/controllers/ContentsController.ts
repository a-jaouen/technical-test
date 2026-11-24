import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { type Request, type Response, Router } from "express";

import { pokemonIdSchema, validate } from "../schemas.ts";
import { fetchPokemonMarkdown } from "../services/markdown.ts";
import { POKEMON_COUNT, pokemonIds } from "../services/pokeapi.ts";
import { mapPool } from "../utils/mapPool.ts";

const ContentController = Router();

const EXPORT_FOLDER = path.resolve("pokemons-ru");
const EXPORT_CONCURRENCY = 20;

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
 */
ContentController.get("/all", async (_req: Request, res: Response) => {
  await mkdir(EXPORT_FOLDER, { recursive: true });

  // A few pokemon at a time: the export must not queue all 898 ahead of the other requests
  const results = await mapPool(pokemonIds(), EXPORT_CONCURRENCY, async (id) => {
    try {
      const { filename, content } = await fetchPokemonMarkdown(id);
      await writeFile(path.join(EXPORT_FOLDER, filename), content);
      return null;
    } catch {
      return id;
    }
  });
  const failed = results.filter((id) => id !== null);

  return res.status(failed.length ? 502 : 200).send({
    folder: EXPORT_FOLDER,
    exported: POKEMON_COUNT - failed.length,
    failed,
  });
});

/**
 * Return a pokemon as markdown
 * @openapi
 * /contents/{id}:
 *   get:
 *     tags: [Contents]
 *     summary: Download a Pokémon as a Markdown file
 *     parameters:
 *       - $ref: "#/components/parameters/PokemonId"
 *     responses:
 *       200:
 *         description: The Markdown file, sent as an attachment (e.g. `25-pikachu.md`)
 *         content:
 *           text/markdown:
 *             schema: { type: string }
 *       400: { $ref: "#/components/responses/BadRequest" }
 *       502: { $ref: "#/components/responses/BadGateway" }
 */
ContentController.get("/:id", async (req: Request, res: Response) => {
  const id = validate(pokemonIdSchema, req.params.id);
  const { filename, content } = await fetchPokemonMarkdown(id);

  return res.attachment(filename).type("text/markdown").send(content);
});

export { ContentController };
