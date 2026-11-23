import swaggerJsdoc from "swagger-jsdoc";

/**
 * OpenAPI document generated from the `@openapi` JSDoc blocks of the routes.
 * The production build inlines the result (see rolldown.config.ts), sources are not shipped.
 */
export const openapi = swaggerJsdoc({
  definition: {
    openapi: "3.1.0",
    info: {
      title: "PokeBattle API",
      version: "1.0.0",
      description: "Pokémon data adapted from PokeAPI, plus Markdown exports.",
    },
  },
  apis: ["src/app.ts", "src/controllers/*.ts"],
});
