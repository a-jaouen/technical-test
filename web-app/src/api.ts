import axios, { isAxiosError } from "axios";

import type { BattleTeam, PokemonPage } from "./types/pokemon";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3001",
});

// A failed request is thrown as an Error carrying the message answered by the backend
api.interceptors.response.use(undefined, async (error: unknown) => {
  if (!isAxiosError(error) || !error.response) throw error;

  let body = error.response.data;
  if (body instanceof ReadableStream) {
    try {
      body = await new Response(body).json();
    } catch {
      body = null;
    }
  }

  throw new Error(body?.error ?? `Request failed (${error.response.status})`);
});

/**
 * Fetch one page of the pokemon list
 * @param offset - How many pokemon to skip
 * @param limit - How many pokemon the page holds at most
 * @param signal - Cancels the request
 */
export async function getPokemonPage(
  offset: number,
  limit: number,
  signal: AbortSignal,
): Promise<PokemonPage> {
  const { data } = await api.get<PokemonPage>("/pokemons", {
    params: { offset, limit },
    signal,
  });

  return data;
}

/**
 * Start a battle and yield each piece of the commentary as the backend streams it
 * @param teams - Teams fighting each other
 * @param signal - Cancels the battle
 */
export async function* streamBattle(
  teams: BattleTeam[],
  signal: AbortSignal,
): AsyncGenerator<string> {
  const { data } = await api.post<ReadableStream<Uint8Array<ArrayBuffer>>>(
    "/battles",
    { teams },
    { adapter: "fetch", responseType: "stream", signal },
  );

  const reader = data.pipeThrough(new TextDecoderStream()).getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) return;
    yield value;
  }
}
