import { type Request, type Response, Router } from "express";

import { battleSchema } from "../schemas.ts";
import { buildBattlePrompt } from "../services/battle.ts";
import { askChatbot } from "../services/chatbot.ts";
import { fetchPokemon } from "../services/pokeapi.ts";
import { HttpError } from "../utils/HttpError.ts";

const BattleController = Router();

/**
 * Simulate a battle
 * @openapi
 * /battles:
 *   post:
 *     tags: [Battles]
 *     summary: Simulate a battle between Pokémon
 *     description: Asks the Virtual Brain chatbot to narrate the battle and streams its answer as it is written.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [pokemonIds]
 *             properties:
 *               pokemonIds:
 *                 type: array
 *                 description: Pokédex ids of the fighters, all different
 *                 minItems: 2
 *                 maxItems: 6
 *                 items: { type: integer, minimum: 1, maximum: 898 }
 *                 example: [25, 6]
 *     responses:
 *       200:
 *         description: The battle, streamed as plain text
 *         content:
 *           text/plain:
 *             schema: { type: string }
 *       400: { $ref: "#/components/responses/BadRequest" }
 *       502: { $ref: "#/components/responses/BadGateway" }
 */
BattleController.post("/", async (req: Request, res: Response) => {
  const { error, value } = battleSchema.validate(req.body);
  if (error) throw new HttpError(400, error.message);

  const pokemonIds: number[] = value.pokemonIds;
  const fighters = await Promise.all(pokemonIds.map((id) => fetchPokemon(id)));

  // Stop asking the chatbot when the user leaves the arena before the end
  const abort = new AbortController();
  res.on("close", () => abort.abort());

  const answer = askChatbot(buildBattlePrompt(fighters), abort.signal);

  try {
    // Wait for the first chunk before committing to a 200: a chatbot failure can still be a JSON error
    let chunk = await answer.next();
    res.type("text/plain");
    while (!chunk.done) {
      res.write(chunk.value);
      chunk = await answer.next();
    }
  } catch (error) {
    // Nobody is listening any more, there is nothing to answer
    if (abort.signal.aborted) return;
    throw error;
  }

  return res.end();
});

export { BattleController };
