import swaggerJsdoc from "swagger-jsdoc";

import { components } from "./components.ts";

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
  apis: ["src/controllers/*.ts"],
});
