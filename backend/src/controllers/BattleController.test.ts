import { expect, test, vi } from "vitest";

import { useTestServer } from "../utils/testServer.ts";

/* The chatbot is replaced by one that answers with the prompt it was sent */
vi.mock("../services/chatbot.ts", () => ({
  askChatbot: async function* (query: string) {
    yield query;
  },
}));

const request = useTestServer();

test("POST /battles streams the chatbot's answer about the fighters", async () => {
  const response = await request("/battles", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ teams: [{ pokemonIds: [25] }, { pokemonIds: [95] }] }),
  });

  expect(response.status).toBe(200);
  expect(response.headers.get("content-type")).toContain("text/plain");
  expect(await response.text()).toBe("Simulate a Pokémon battle between Pikachu and Onix.");
});
