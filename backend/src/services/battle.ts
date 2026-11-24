import { label } from "./markdown.ts";

/**
 * Defence in depth: names come from PokeAPI, not from the user, but they are the only variable text
 * sent to the chatbot. Keeping letters, digits and spaces means a tampered name cannot add
 * punctuation or line breaks to step out of the sentence it is placed in.
 */
const safeName = (name: string): string => label(name).replace(/[^\p{L}\p{N} ]/gu, "");

/**
 * Build the message asking the chatbot to narrate a battle.
 * Only the names are sent, so that the chatbot's search finds the fighters' files. The chatbot knows
 * their stats, moves and resistances from the Markdown exported by `GET /contents/all`, and the
 * battle rules and answer format from its custom prompt, set in Virtual Brain.
 *
 * Nothing typed by the user reaches the chatbot: the request only carries Pokédex IDs, validated as
 * integers in range, and the names are looked up from them.
 */
export function buildBattlePrompt(names: string[]): string {
  return `Simulate a Pokémon battle between ${new Intl.ListFormat("en").format(names.map(safeName))}.`;
}
