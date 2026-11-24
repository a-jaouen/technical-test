import { expect, test } from "vitest";

import { useTestServer } from "../utils/testServer.ts";

const request = useTestServer();

test("GET /ping answers pong", async () => {
  const response = await request("/ping");

  expect(response.status).toBe(200);
  expect(await response.text()).toBe("pong");
});
