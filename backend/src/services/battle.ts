import type { Pokemon } from "../types/pokemon.ts";
import { label } from "./markdown.ts";

/**
 * Build the message asking the chatbot to narrate a battle.
 * The chatbot knows each pokemon from the Markdown files exported by `GET /contents/all`. The moves
 * are repeated here so that the battle never depends on the chatbot retrieving the right excerpt.
 */
export function buildBattlePrompt(fighters: Pokemon[]): string {
  const names = new Intl.ListFormat("en").format(fighters.map(({ name }) => label(name)));

  return `Simulate a Pokémon battle between ${names}.

Rules:
- Look up every fighter in your knowledge base first and rely on its file for its Stats and its Resistances table.
- Each round, the Pokémon with the higher Speed attacks first.
- An attack must be one of the attacker's moves listed above. Physical moves use Attack against Defense, special moves use Special Attack against Special Defense.
- Read the defender's Resistances table for the move's type: x2 or x4 is super effective, x0.5 or x0.25 is not very effective, x0 has no effect.
- Track each Pokémon's remaining HP as a percentage. The battle ends when only one Pokémon is left standing, within 3 to 6 rounds.

Format:
- Start with one or two sentences introducing the fighters and the key matchup.
- Then one short paragraph per round, starting with "Round 1:", "Round 2:", and so on.
- End with a line starting with "Winner:" followed by the Pokémon's name and one sentence explaining why.
- Plain text only: no Markdown, no asterisks, no headings, no lists. Under 600 words.`;
}
