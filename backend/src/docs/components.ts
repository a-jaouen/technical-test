import { DEFAULT_PAGE_SIZE, MAX_FIGHTERS, MAX_PAGE_SIZE, MIN_FIGHTERS } from "../schemas.ts";
import { POKEMON_COUNT } from "../services/pokeapi.ts";
import { DamageRelation, MoveCategory, TypeName } from "../types/pokemon.ts";

const ref = (schema: string) => ({ $ref: `#/components/schemas/${schema}` });

const errorResponse = (description: string) => ({
  description,
  content: { "application/json": { schema: ref("Error") } },
});

const typeName = { type: "string", enum: Object.values(TypeName), example: TypeName.Electric };

/**
 * OpenAPI components shared by the routes.
 * The `@openapi` blocks of the controllers point at them, e.g. `$ref: "#/components/schemas/Pokemon"`.
 */
export const components = {
  parameters: {
    PokemonId: {
      name: "id",
      in: "path",
      required: true,
      description: "Pokédex id",
      schema: { type: "integer", minimum: 1, maximum: POKEMON_COUNT, example: 25 },
    },
    Limit: {
      name: "limit",
      in: "query",
      description: "How many Pokémon to return",
      schema: { type: "integer", minimum: 1, maximum: MAX_PAGE_SIZE, default: DEFAULT_PAGE_SIZE },
    },
    Offset: {
      name: "offset",
      in: "query",
      description: "How many Pokémon to skip, in Pokédex order",
      schema: { type: "integer", minimum: 0, default: 0 },
    },
  },

  responses: {
    BadRequest: errorResponse("The request is not valid, the error says what is wrong"),
    BadGateway: errorResponse("PokeAPI or the chatbot could not be reached"),
  },

  schemas: {
    Error: {
      type: "object",
      properties: { error: { type: "string" } },
    },
    Stats: {
      type: "object",
      properties: {
        HP: { type: "integer", example: 35 },
        attack: { type: "integer", example: 55 },
        defense: { type: "integer", example: 40 },
        special_attack: { type: "integer", example: 50 },
        special_defense: { type: "integer", example: 50 },
        speed: { type: "integer", example: 90 },
      },
    },
    PokemonSummary: {
      type: "object",
      properties: {
        id: { type: "integer", example: 25 },
        name: { type: "string", example: "pikachu" },
        image: { type: "string", format: "uri" },
        types: { type: "array", items: typeName },
        stats: ref("Stats"),
      },
    },
    PokemonPage: {
      type: "object",
      properties: {
        pokemons: { type: "array", items: ref("PokemonSummary") },
        total: { type: "integer", example: POKEMON_COUNT, description: "Across all pages" },
        limit: { type: "integer", example: DEFAULT_PAGE_SIZE },
        offset: { type: "integer", example: 0 },
      },
    },
    Move: {
      type: "object",
      properties: {
        name: { type: "string", example: "thunder" },
        type: typeName,
        category: { type: "string", enum: Object.values(MoveCategory) },
        power: { type: "integer", example: 110 },
        accuracy: {
          type: ["integer", "null"],
          example: 70,
          description: "`null` when the move never misses",
        },
      },
    },
    Resistance: {
      type: "object",
      properties: {
        name: { ...typeName, description: "The attacking type", example: TypeName.Ground },
        damage_multiplier: { type: "number", example: 2 },
        damage_relation: {
          type: "string",
          enum: Object.values(DamageRelation),
          example: DamageRelation.Vulnerable,
        },
      },
    },
    Pokemon: {
      type: "object",
      properties: {
        id: { type: "integer", example: 25 },
        pokedexId: { type: "integer", example: 25 },
        name: { type: "string", example: "pikachu" },
        slug: { type: "string", example: "pikachu" },
        image: { type: "string", format: "uri" },
        sprite: { type: "string", format: "uri" },
        stats: ref("Stats"),
        apiTypes: {
          type: "array",
          items: {
            type: "object",
            properties: { name: typeName, image: { type: "string", format: "uri" } },
          },
        },
        apiGeneration: { type: "integer", example: 1 },
        apiResistances: { type: "array", items: ref("Resistance") },
        resistanceModifyingAbilitiesForApi: {
          type: "object",
          properties: {
            name: { type: "string", example: "static" },
            slug: { type: "string", example: "static" },
          },
        },
        apiEvolutions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string", example: "raichu" },
              pokedexId: { type: "integer", example: 26 },
            },
          },
        },
        apiPreEvolution: {
          type: "string",
          example: "pichu",
          description: "`none` when there is no pre-evolution",
        },
        apiResistancesWithAbilities: { type: "array", items: ref("Resistance") },
        apiMoves: {
          type: "array",
          description: "The strongest attacks learned by levelling up (6 at most)",
          items: ref("Move"),
        },
      },
    },
    BattleRequest: {
      type: "object",
      required: ["pokemonIds"],
      properties: {
        pokemonIds: {
          type: "array",
          description: "Pokédex ids of the fighters, all different",
          minItems: MIN_FIGHTERS,
          maxItems: MAX_FIGHTERS,
          items: { type: "integer", minimum: 1, maximum: POKEMON_COUNT },
          example: [25, 6],
        },
      },
    },
    ExportResult: {
      type: "object",
      properties: {
        folder: { type: "string", example: "/app/pokemons-ru" },
        exported: { type: "integer", example: POKEMON_COUNT },
        failed: { type: "array", items: { type: "integer" }, description: "Ids not exported" },
      },
    },
  },
};
