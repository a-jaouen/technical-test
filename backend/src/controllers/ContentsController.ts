import { type Request, type Response, Router } from "express";

import { pokemonIdSchema, validate } from "../schemas.ts";
import { exportAllPokemons, fetchPokemonMarkdown } from "../services/markdown.ts";

const ContentController = Router();

/**
 * Save all pokemon as markdown in the pokemons-ru folder
 * @openapi
 * /contents/all:
 *   get:
 *     tags: [Contents]
 *     summary: Export every Pokémon as Markdown files
 *     description: Writes one Markdown file per Pokémon into the local `pokemons-ru` folder.
 *     responses:
 *       200:
 *         description: Every Pokémon was exported
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/ExportResult" }
 *       500:
 *         description: Some Pokémon could not be exported, their ids are in `failed`
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/ExportResult" }
 */
ContentController.get("/all", async (_req: Request, res: Response) => {
  const result = await exportAllPokemons();

  return res.status(result.failed.length ? 500 : 200).send(result);
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
 *       500: { $ref: "#/components/responses/InternalError" }
 */
ContentController.get("/:id", async (req: Request, res: Response) => {
  const id = validate(pokemonIdSchema, req.params.id);
  const { filename, content } = await fetchPokemonMarkdown(id);

  return res.attachment(filename).type("text/markdown").send(content);
});

export { ContentController };
