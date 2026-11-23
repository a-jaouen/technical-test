import swaggerJsdoc from "swagger-jsdoc";

import { components } from "./components.ts";

/**
 * OpenAPI document generated from the `@openapi` JSDoc blocks of the routes and the shared components.
 * The production build inlines the result (see rolldown.config.ts), sources are not shipped.
 */
export const openapi = swaggerJsdoc({
  definition: {
    openapi: "3.1.0",
    info: {
      title: "PokeBattle API",
      version: "1.0.0",
      description:
        "Pokémon data adapted from PokeAPI, Markdown exports and battles narrated by a chatbot.",
    },
    components,
  },
  apis: ["src/app.ts", "src/controllers/*.ts"],
});
