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
import { mapPool } from "../utils/mapPool.ts";

const POKEAPI_URL = "https://pokeapi.co/api/v2";

/** Generations 1 to 8 */
export const POKEMON_COUNT = 898;
const LIST_CONCURRENCY = 20;
const MOVE_COUNT = 6;
/** Keeps the selection varied: without it most pokemon would only list moves of their own type */
const MOVES_PER_TYPE = 3;

/** Without a timeout a single hung connection would block a request (or the whole export) forever */
const api = axios.create({ timeout: 10_000 });

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

interface ApiEvolutionChain {
  chain: ApiChainLink;
}

const DAMAGE_RELATIONS: Record<number, DamageRelation> = {
  0: DamageRelation.Immune,
  0.25: DamageRelation.TwiceResistant,
  0.5: DamageRelation.Resistant,
  1: DamageRelation.Neutral,
  2: DamageRelation.Vulnerable,
  4: DamageRelation.TwiceVulnerable,
};

/** Extract the trailing id from a PokeAPI resource url (e.g. .../generation/1/) */
const idFromUrl = (url: string): number => Number(url.split("/").filter(Boolean).pop());

const baseStat = (pokemon: ApiPokemon, name: string): number =>
  pokemon.stats.find((s) => s.stat.name === name)?.base_stat ?? 0;

const computeResistances = (types: ApiType[]): Resistance[] =>
  Object.values(TypeName).map((attacker) => {
    const damage_multiplier = types.reduce((multiplier, { damage_relations: relations }) => {
      if (relations.no_damage_from.some((t) => t.name === attacker)) return 0;
      if (relations.double_damage_from.some((t) => t.name === attacker)) return multiplier * 2;
      if (relations.half_damage_from.some((t) => t.name === attacker)) return multiplier * 0.5;
      return multiplier;
    }, 1);

    return {
      name: attacker,
      damage_multiplier,
      damage_relation: DAMAGE_RELATIONS[damage_multiplier],
    };
  });

const findChainLink = (link: ApiChainLink, speciesName: string): ApiChainLink | undefined =>
  link.species.name === speciesName
    ? link
    : link.evolves_to.map((child) => findChainLink(child, speciesName)).find(Boolean);

/**
 * Fetch a resource once and keep it in memory: PokeAPI data never changes.
 * `select` keeps only what is needed, a raw pokemon or move is over 100 KB and there are hundreds of them.
 */
const cache = new Map<string, Promise<unknown>>();
function getCached<T, R = T>(url: string, select?: (data: T) => R): Promise<R> {
  const load = async () => {
    try {
      const { data } = await api.get<T>(url);
      return select ? select(data) : data;
    } catch (error) {
      // Do not keep a failure: the next call tries again
      cache.delete(url);
      throw error;
    }
  };

  if (!cache.has(url)) cache.set(url, load());
  return cache.get(url) as Promise<R>;
}

const toStats = (pokemon: ApiPokemon): StatBlock => ({
  HP: baseStat(pokemon, "hp"),
  attack: baseStat(pokemon, "attack"),
  defense: baseStat(pokemon, "defense"),
  special_attack: baseStat(pokemon, "special-attack"),
  special_defense: baseStat(pokemon, "special-defense"),
  speed: baseStat(pokemon, "speed"),
});

/** The types of a pokemon, main type first */
const typeNames = (pokemon: ApiPokemon): TypeName[] =>
  [...pokemon.types].sort((a, b) => a.slot - b.slot).map(({ type }) => type.name as TypeName);

const artwork = (pokemon: ApiPokemon): string =>
  pokemon.sprites.other["official-artwork"].front_default ?? "";

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
async function fetchMoves(pokemon: ApiPokemon): Promise<Move[]> {
  const types = typeNames(pokemon);
  const strength = (move: Move) => move.power * (types.includes(move.type) ? 1.5 : 1);

  const learned = pokemon.moves.filter(({ version_group_details: details }) =>
    details.some((detail) => detail.move_learn_method.name === "level-up"),
  );
  const moves = await Promise.all(learned.map(({ move }) => getCached(move.url, toMove)));
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

const toSummary = (pokemon: ApiPokemon): PokemonSummary => ({
  id: pokemon.id,
  name: pokemon.name,
  image: artwork(pokemon),
  types: typeNames(pokemon),
  stats: toStats(pokemon),
});

/**
 * Fetch one page of the pokemon list, as light summaries in pokedex order
 */
export async function fetchPokemonPage(offset: number, limit: number): Promise<PokemonPage> {
  const count = Math.max(0, Math.min(limit, POKEMON_COUNT - offset));
  const ids = Array.from({ length: count }, (_, index) => offset + index + 1);

  const pokemons = await mapPool(ids, LIST_CONCURRENCY, (id) =>
    getCached(`${POKEAPI_URL}/pokemon/${id}`, toSummary),
  );

  return { pokemons, total: POKEMON_COUNT, limit, offset };
}

/**
 * Fetch a pokemon from PokeAPI and adapt it to the legacy pokebuildapi `Pokemon` shape
 */
export async function fetchPokemon(id: number): Promise<Pokemon> {
  const { data: pokemon } = await api.get<ApiPokemon>(`${POKEAPI_URL}/pokemon/${id}`);

  const [types, { data: species }, apiMoves] = await Promise.all([
    Promise.all(
      [...pokemon.types]
        .sort((a, b) => a.slot - b.slot)
        .map(({ type }) => getCached<ApiType>(type.url)),
    ),
    api.get<ApiSpecies>(pokemon.species.url),
    fetchMoves(pokemon),
  ]);

  const evolutionChain = await getCached<ApiEvolutionChain>(species.evolution_chain.url);

  const apiEvolutions: Evolution[] = (
    findChainLink(evolutionChain.chain, species.name)?.evolves_to ?? []
  ).map(({ species: evolution }) => ({
    name: evolution.name,
    pokedexId: idFromUrl(evolution.url),
  }));

  const apiResistances = computeResistances(types);
  const firstAbility = pokemon.abilities[0]?.ability;

  return {
    id: pokemon.id,
    pokedexId: pokemon.id,
    name: pokemon.name,
    image: artwork(pokemon),
    sprite: pokemon.sprites.front_default ?? "",
    slug: pokemon.name,
    stats: toStats(pokemon),
    apiTypes: types.map((type) => ({
      name: type.name as TypeName,
      image: type.sprites["generation-viii"]["sword-shield"].name_icon ?? "",
    })),
    apiGeneration: idFromUrl(species.generation.url),
    apiResistances,
    // PokeAPI has no equivalent: best effort with the first ability
    resistanceModifyingAbilitiesForApi: {
      name: firstAbility?.name ?? "",
      slug: firstAbility?.name ?? "",
    },
    apiEvolutions,
    apiPreEvolution: species.evolves_from_species?.name ?? "none",
    // PokeAPI does not compute ability effects on resistances
    apiResistancesWithAbilities: apiResistances,
    apiMoves,
  };
}
