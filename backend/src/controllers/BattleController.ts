import { type Request, type Response, Router } from "express";

import { battleSchema, validate } from "../schemas.ts";
import { buildBattlePrompt } from "../services/battle.ts";
import { askChatbot } from "../services/chatbot.ts";
import { fetchPokemonCore } from "../services/pokeapi.ts";

const BattleController = Router();

/**
 * Simulate a battle
 * @openapi
 * /battles:
 *   post:
 *     tags: [Battles]
 *     summary: Simulate a battle between two teams of Pokémon
 *     description: Asks the Virtual Brain chatbot to narrate the battle and streams its answer as it is written.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: "#/components/schemas/BattleRequest" }
 *     responses:
 *       200:
 *         description: The battle, streamed as plain text
 *         content:
 *           text/plain:
 *             schema: { type: string }
 *       400: { $ref: "#/components/responses/BadRequest" }
 *       500: { $ref: "#/components/responses/InternalError" }
 */
BattleController.post("/", async (req: Request, res: Response) => {
  const { teams } = validate(battleSchema, req.body);
  const pokemonIds = teams.flatMap((team) => team.pokemonIds);

  const abort = new AbortController();
  res.on("close", () => abort.abort());

  const fighters = await Promise.all(pokemonIds.map((id) => fetchPokemonCore(id)));
  if (abort.signal.aborted) return;

  const names = fighters.map(({ name }) => name);
  const answer = askChatbot(buildBattlePrompt(names), abort.signal);

  try {
    let chunk = await answer.next();
    res.type("text/plain");
    while (!chunk.done) {
      res.write(chunk.value);
      chunk = await answer.next();
    }
  } catch (error) {
    if (abort.signal.aborted) return;
    throw error;
  }

  return res.end();
});

export { BattleController };
