import { expect, test } from "vitest";

import { useTestServer } from "../utils/testServer.ts";

const request = useTestServer();

test("GET /contents/{id} returns the pokemon as a Markdown file", async () => {
  const response = await request("/contents/25");

  expect(response.status).toBe(200);
  expect(response.headers.get("content-type")).toContain("text/markdown");
  expect(response.headers.get("content-disposition")).toContain("25-pikachu.md");
  expect(await response.text()).toContain("# Pikachu (#25)");
});
