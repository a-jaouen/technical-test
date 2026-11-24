import type { Server } from "node:http";
import type { AddressInfo } from "node:net";

import { afterAll, beforeAll } from "vitest";

import { app } from "../app.ts";

/**
 * Serve the app on a free port for the tests of a file, and return a function that calls it
 *
 * TODO: PokeAPI is called for real, so the tests need the network and depend on its data.
 * It should be mocked (e.g. recorded answers served in place of `pokeapi.co`).
 */
export function useTestServer(): (path: string, init?: RequestInit) => Promise<Response> {
  let server: Server;

  beforeAll(() => {
    server = app.listen(0);
  });

  afterAll(() => {
    server.close();
  });

  return (path, init) =>
    fetch(`http://localhost:${(server.address() as AddressInfo).port}${path}`, init);
}
