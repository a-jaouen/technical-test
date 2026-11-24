import { label } from "../utils/helpers.ts";

/**
 * Format a pokemon name for the prompt, keeping only letters, digits and spaces so that a tampered name cannot step out of its sentence
 * @param name - Pokemon slug, as named by PokeAPI
 */
const safeName = (name: string): string => label(name).replace(/[^\p{L}\p{N} ]/gu, "");

/**
 * Build the message asking the chatbot to narrate a battle: the rules and the fighters' data are already known to the chatbot
 * @param names - Slugs of the fighters, looked up from their Pokédex ids
 */
export function buildBattlePrompt(names: string[]): string {
  return `Simulate a Pokémon battle between ${new Intl.ListFormat("en").format(names.map(safeName))}.`;
}
