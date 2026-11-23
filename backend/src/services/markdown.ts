import type { Pokemon } from "../controllers/PokemonController.ts";
import { fetchPokemon } from "./pokeapi.ts";

export interface MarkdownFile {
  filename: string;
  content: string;
}

/** "mr-mime" -> "Mr Mime", "special_attack" -> "Special Attack" */
const label = (slug: string): string =>
  slug
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const table = (headers: string[], rows: (string | number)[][]): string =>
  [headers, headers.map(() => "---"), ...rows].map((row) => `| ${row.join(" | ")} |`).join("\n");

/**
 * Convert a pokemon to a Markdown document
 */
export function pokemonToMarkdown(pokemon: Pokemon): string {
  const name = label(pokemon.name);
  const evolutions = pokemon.apiEvolutions.map((e) => `${label(e.name)} (#${e.pokedexId})`);

  return [
    `# ${name} (#${pokemon.pokedexId})`,
    `![${name}](${pokemon.image})`,
    [
      `- **Pokédex ID**: ${pokemon.pokedexId}`,
      `- **Generation**: ${pokemon.apiGeneration}`,
      `- **Types**: ${pokemon.apiTypes.map((type) => label(type.name)).join(", ")}`,
      `- **Ability**: ${label(pokemon.resistanceModifyingAbilitiesForApi.name) || "None"}`,
      `- **Evolves from**: ${pokemon.apiPreEvolution === "none" ? "None" : label(pokemon.apiPreEvolution)}`,
      `- **Evolves into**: ${evolutions.join(", ") || "None"}`,
    ].join("\n"),
    "## Stats",
    table(
      ["Stat", "Value"],
      Object.entries(pokemon.stats).map(([stat, value]) => [label(stat), value]),
    ),
    "## Resistances",
    table(
      ["Attacking type", "Damage multiplier", "Relation"],
      pokemon.apiResistances.map((resistance) => [
        label(resistance.name),
        `x${resistance.damage_multiplier}`,
        label(resistance.damage_relation),
      ]),
    ),
  ]
    .join("\n\n")
    .concat("\n");
}

/**
 * Fetch a pokemon and build its Markdown file (e.g. `25-pikachu.md`)
 */
export async function fetchPokemonMarkdown(pokedexId: number): Promise<MarkdownFile> {
  const pokemon = await fetchPokemon(String(pokedexId));

  return {
    filename: `${pokemon.pokedexId}-${pokemon.slug}.md`,
    content: pokemonToMarkdown(pokemon),
  };
}
