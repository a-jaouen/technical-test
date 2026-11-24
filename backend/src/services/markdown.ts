import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import type { Pokemon } from "../types/pokemon.ts";
import { label, mapPool } from "../utils/helpers.ts";
import { fetchPokemon, pokemonIds } from "./pokeapi.ts";

const EXPORT_FOLDER = path.resolve("pokemons-ru");
const EXPORT_CONCURRENCY = 20;

interface MarkdownFile {
  filename: string;
  content: string;
}

interface ExportResult {
  folder: string;
  exported: number;
  failed: number[];
}

/**
 * Build a Markdown table
 * @param headers - Column titles
 * @param rows - Cells of each row, in column order
 */
const table = (headers: string[], rows: (string | number)[][]): string =>
  [headers, headers.map(() => "---"), ...rows].map((row) => `| ${row.join(" | ")} |`).join("\n");

/**
 * Convert a pokemon to a Markdown document
 * @param pokemon - Pokemon to describe
 */
function pokemonToMarkdown(pokemon: Pokemon): string {
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
    "## Moves",
    table(
      ["Move", "Type", "Category", "Power", "Accuracy"],
      pokemon.apiMoves.map((move) => [
        label(move.name),
        label(move.type),
        label(move.category),
        move.power,
        move.accuracy === null ? "Never misses" : `${move.accuracy}%`,
      ]),
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
 * @param pokedexId - Pokédex id of the pokemon
 */
export async function fetchPokemonMarkdown(pokedexId: number): Promise<MarkdownFile> {
  const pokemon = await fetchPokemon(pokedexId);

  return {
    filename: `${pokemon.pokedexId}-${pokemon.slug}.md`,
    content: pokemonToMarkdown(pokemon),
  };
}

/**
 * Save every pokemon as a Markdown file in the `pokemons-ru` folder, and list the ones that could not be exported
 */
export async function exportAllPokemons(): Promise<ExportResult> {
  await mkdir(EXPORT_FOLDER, { recursive: true });

  const ids = pokemonIds();
  const results = await mapPool(ids, EXPORT_CONCURRENCY, async (id) => {
    try {
      const { filename, content } = await fetchPokemonMarkdown(id);
      await writeFile(path.join(EXPORT_FOLDER, filename), content);
      return null;
    } catch (error) {
      console.error(`Pokemon #${id} could not be exported:`, error);
      return id;
    }
  });
  const failed = results.filter((id) => id !== null);

  return { folder: EXPORT_FOLDER, exported: ids.length - failed.length, failed };
}
