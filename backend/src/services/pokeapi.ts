import { Agent } from "node:https";

import axios from "axios";

import {
  DamageRelation,
  type Evolution,
  type Move,
  MoveCategory,
  type Pokemon,
  type PokemonPage,
  type PokemonSummary,
  type Resistance,
  type StatBlock,
  TypeName,
} from "../types/pokemon.ts";
import { HttpError } from "../utils/HttpError.ts";

const POKEAPI_URL = "https://pokeapi.co/api/v2";

/** Generations 1 to 8 */
export const POKEMON_COUNT = 898;
/** How many requests PokeAPI sees at once, whatever is being fetched (a pokemon alone has up to 100 moves) */
const MAX_REQUESTS = 20;
const MOVE_COUNT = 6;
/** Keeps the selection varied: without it most pokemon would only list moves of their own type */
const MOVES_PER_TYPE = 3;

/**
 * - `timeout`: without it a single hung connection would block a request (or the whole export) forever
 * - `maxSockets`: requests beyond `MAX_REQUESTS` wait for a free connection instead of flooding PokeAPI
 */
const api = axios.create({
  timeout: 10_000,
  httpsAgent: new Agent({ keepAlive: true, maxSockets: MAX_REQUESTS }),
});

// Callers only need to know that PokeAPI failed, not how
api.interceptors.response.use(undefined, () => {
  throw new HttpError(502, "PokeAPI could not be reached");
});

/* ------------------------- What PokeAPI answers -------------------------- */

interface NamedResource {
  name: string;
  url: string;
}

interface ApiPokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string | null;
    other: { "official-artwork": { front_default: string | null } };
  };
  stats: { base_stat: number; stat: NamedResource }[];
  types: { slot: number; type: NamedResource }[];
  abilities: { ability: NamedResource }[];
  moves: { move: NamedResource; version_group_details: { move_learn_method: NamedResource }[] }[];
  species: NamedResource;
}

interface ApiMove {
  name: string;
  power: number | null;
  accuracy: number | null;
  type: NamedResource;
  damage_class: NamedResource;
}

interface ApiType {
  name: string;
  damage_relations: {
    double_damage_from: NamedResource[];
    half_damage_from: NamedResource[];
    no_damage_from: NamedResource[];
  };
  sprites: { "generation-viii": { "sword-shield": { name_icon: string | null } } };
}

interface ApiSpecies {
  name: string;
  generation: NamedResource;
  evolves_from_species: NamedResource | null;
  evolution_chain: { url: string };
}

interface ApiChainLink {
  species: NamedResource;
  evolves_to: ApiChainLink[];
}

/* ----- What is kept of it: a raw answer is 20 to 350 KB, mostly unused ---- */

interface PokemonCore {
  id: number;
  name: string;
  image: string;
  sprite: string;
  stats: StatBlock;
  /** Main type first */
  types: NamedResource[];
  /** PokeAPI has no "resistance modifying ability": best effort with the first ability */
  ability: string;
  /** The moves learned by levelling up */
  moveUrls: string[];
  speciesUrl: string;
}

interface TypeDetails {
  name: TypeName;
  image: string;
  doubleDamageFrom: string[];
  halfDamageFrom: string[];
  noDamageFrom: string[];
}

interface Species {
  name: string;
  generation: number;
  preEvolution: string;
  evolutionChainUrl: string;
}

interface EvolutionLink extends Evolution {
  evolvesTo: EvolutionLink[];
}

/** Extract the trailing id from a PokeAPI resource url (e.g. .../generation/1/) */
const idFromUrl = (url: string): number => Number(url.split("/").filter(Boolean).pop());

const names = (resources: NamedResource[]): string[] => resources.map(({ name }) => name);

const toCore = (pokemon: ApiPokemon): PokemonCore => {
  const stat = (name: string) => pokemon.stats.find((s) => s.stat.name === name)?.base_stat ?? 0;

  return {
    id: pokemon.id,
    name: pokemon.name,
    image: pokemon.sprites.other["official-artwork"].front_default ?? "",
    sprite: pokemon.sprites.front_default ?? "",
    stats: {
      HP: stat("hp"),
      attack: stat("attack"),
      defense: stat("defense"),
      special_attack: stat("special-attack"),
      special_defense: stat("special-defense"),
      speed: stat("speed"),
    },
    types: [...pokemon.types].sort((a, b) => a.slot - b.slot).map(({ type }) => type),
    ability: pokemon.abilities[0]?.ability.name ?? "",
    moveUrls: pokemon.moves
      .filter(({ version_group_details: details }) =>
        details.some((detail) => detail.move_learn_method.name === "level-up"),
      )
      .map(({ move }) => move.url),
    speciesUrl: pokemon.species.url,
  };
};

/** Status moves have no power: they are left out, a battle only needs attacks */
const toMove = (move: ApiMove): Move | null =>
  move.power && move.damage_class.name !== "status"
    ? {
        name: move.name,
        type: move.type.name as TypeName,
        category: move.damage_class.name as MoveCategory,
        power: move.power,
        accuracy: move.accuracy,
      }
    : null;

const toType = ({ name, damage_relations: relations, sprites }: ApiType): TypeDetails => ({
  name: name as TypeName,
  image: sprites["generation-viii"]["sword-shield"].name_icon ?? "",
  doubleDamageFrom: names(relations.double_damage_from),
  halfDamageFrom: names(relations.half_damage_from),
  noDamageFrom: names(relations.no_damage_from),
});

const toSpecies = (species: ApiSpecies): Species => ({
  name: species.name,
  generation: idFromUrl(species.generation.url),
  preEvolution: species.evolves_from_species?.name ?? "none",
  evolutionChainUrl: species.evolution_chain.url,
});

const toEvolutionLink = ({ species, evolves_to }: ApiChainLink): EvolutionLink => ({
  name: species.name,
  pokedexId: idFromUrl(species.url),
  evolvesTo: evolves_to.map(toEvolutionLink),
});

const cache = new Map<string, Promise<unknown>>();

/**
 * Fetch a resource once and keep what `select` picks from it: PokeAPI data never changes.
 */
function getCached<T, R>(url: string, select: (data: T) => R): Promise<R> {
  const load = async () => {
    try {
      const { data } = await api.get<T>(url);
      return select(data);
    } catch (error) {
      // Do not keep a failure: the next call tries again
      cache.delete(url);
      throw error;
    }
  };

  if (!cache.has(url)) cache.set(url, load());
  return cache.get(url) as Promise<R>;
}

export const fetchPokemonCore = (id: number): Promise<PokemonCore> =>
  getCached(`${POKEAPI_URL}/pokemon/${id}`, toCore);

const typeNames = (pokemon: PokemonCore): TypeName[] => names(pokemon.types) as TypeName[];

/* ------------------------------- Resistances ------------------------------ */

const DAMAGE_RELATIONS: Record<number, DamageRelation> = {
  0: DamageRelation.Immune,
  0.25: DamageRelation.TwiceResistant,
  0.5: DamageRelation.Resistant,
  1: DamageRelation.Neutral,
  2: DamageRelation.Vulnerable,
  4: DamageRelation.TwiceVulnerable,
};

const computeResistances = (types: TypeDetails[]): Resistance[] =>
  Object.values(TypeName).map((attacker) => {
    const damage_multiplier = types.reduce((multiplier, type) => {
      if (type.noDamageFrom.includes(attacker)) return 0;
      if (type.doubleDamageFrom.includes(attacker)) return multiplier * 2;
      if (type.halfDamageFrom.includes(attacker)) return multiplier * 0.5;
      return multiplier;
    }, 1);

    return {
      name: attacker,
      damage_multiplier,
      damage_relation: DAMAGE_RELATIONS[damage_multiplier],
    };
  });

/* ---------------------------------- Moves --------------------------------- */

/** What a pokemon uses in the games when it has no usable move */
const STRUGGLE: Move = {
  name: "struggle",
  type: TypeName.Normal,
  category: MoveCategory.Physical,
  power: 50,
  accuracy: null,
};

/**
 * The strongest attacks a pokemon learns by levelling up, favouring its own types (they hit 1.5x harder)
 */
async function fetchMoves(pokemon: PokemonCore): Promise<Move[]> {
  const types = typeNames(pokemon);
  const strength = (move: Move) => move.power * (types.includes(move.type) ? 1.5 : 1);

  const moves = await Promise.all(pokemon.moveUrls.map((url) => getCached(url, toMove)));
  const perType = new Map<string, number>();
  const attacks = moves
    .filter((move) => move !== null)
    .sort((a, b) => strength(b) - strength(a))
    .filter((move) => {
      const count = (perType.get(move.type) ?? 0) + 1;
      perType.set(move.type, count);
      return count <= MOVES_PER_TYPE;
    })
    .slice(0, MOVE_COUNT);

  return attacks.length ? attacks : [STRUGGLE];
}

/* -------------------------------- Evolutions ------------------------------ */

const findEvolutionLink = (link: EvolutionLink, name: string): EvolutionLink | undefined =>
  link.name === name
    ? link
    : link.evolvesTo.map((child) => findEvolutionLink(child, name)).find(Boolean);

/** The species of a pokemon and what it evolves into */
async function fetchLineage(speciesUrl: string) {
  const species = await getCached(speciesUrl, toSpecies);
  const chain = await getCached(
    species.evolutionChainUrl,
    ({ chain: root }: { chain: ApiChainLink }) => toEvolutionLink(root),
  );
  // Later generations gave new evolutions to old pokemon: only the ones that are served are listed
  const evolutions: Evolution[] = (findEvolutionLink(chain, species.name)?.evolvesTo ?? [])
    .filter(({ pokedexId }) => pokedexId <= POKEMON_COUNT)
    .map(({ name, pokedexId }) => ({ name, pokedexId }));

  return { species, evolutions };
}

/* --------------------------------- Exports -------------------------------- */

/** Pokedex ids in order, `limit` of them after skipping `offset`, never past the last pokemon */
export function pokemonIds(offset = 0, limit = POKEMON_COUNT): number[] {
  const count = Math.max(0, Math.min(limit, POKEMON_COUNT - offset));
  return Array.from({ length: count }, (_, index) => offset + index + 1);
}

/**
 * Fetch one page of the pokemon list, as light summaries in pokedex order
 */
export async function fetchPokemonPage(offset: number, limit: number): Promise<PokemonPage> {
  const pokemons = await Promise.all(
    pokemonIds(offset, limit).map(async (id): Promise<PokemonSummary> => {
      const pokemon = await fetchPokemonCore(id);

      return {
        id: pokemon.id,
        name: pokemon.name,
        image: pokemon.image,
        types: typeNames(pokemon),
        stats: pokemon.stats,
      };
    }),
  );

  return { pokemons, total: POKEMON_COUNT, limit, offset };
}

/**
 * Fetch a pokemon from PokeAPI and adapt it to the legacy pokebuildapi `Pokemon` shape
 */
export async function fetchPokemon(id: number): Promise<Pokemon> {
  const pokemon = await fetchPokemonCore(id);

  const [types, { species, evolutions }, apiMoves] = await Promise.all([
    Promise.all(pokemon.types.map(({ url }) => getCached(url, toType))),
    fetchLineage(pokemon.speciesUrl),
    fetchMoves(pokemon),
  ]);
  const apiResistances = computeResistances(types);

  return {
    id: pokemon.id,
    pokedexId: pokemon.id,
    name: pokemon.name,
    image: pokemon.image,
    sprite: pokemon.sprite,
    slug: pokemon.name,
    stats: pokemon.stats,
    apiTypes: types.map(({ name, image }) => ({ name, image })),
    apiGeneration: species.generation,
    apiResistances,
    resistanceModifyingAbilitiesForApi: { name: pokemon.ability, slug: pokemon.ability },
    apiEvolutions: evolutions,
    apiPreEvolution: species.preEvolution,
    // PokeAPI does not compute ability effects on resistances
    apiResistancesWithAbilities: apiResistances,
    apiMoves,
  };
}
