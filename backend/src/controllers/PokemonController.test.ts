import { expect, test } from "vitest";

import { useTestServer } from "../utils/testServer.ts";

const request = useTestServer();

test("GET /pokemons/{id} returns the pokemon", async () => {
  const response = await request("/pokemons/25");
  const { pokemon } = await response.json();

  expect(response.status).toBe(200);
  expect(pokemon).toMatchObject({
    id: 25,
    name: "pikachu",
    apiTypes: [{ name: "electric" }],
    apiGeneration: 1,
    apiPreEvolution: "pichu",
    apiEvolutions: [{ name: "raichu", pokedexId: 26 }],
  });
  expect(pokemon.apiMoves.length).toBeGreaterThan(0);
});
