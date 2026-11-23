import axios, { isAxiosError } from "axios";

import type { PokemonPage } from "./types/pokemon";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3001" });

/** The backend answers failures as `{ error: string }`: turn them into an Error with that message */
async function toError(error: unknown): Promise<unknown> {
  // No answer at all (backend down, request cancelled): nothing to read
  if (!isAxiosError(error) || !error.response) return error;

  let body = error.response.data;
  // A streamed request gets its error body as a stream too
  if (body instanceof ReadableStream) {
    try {
      body = await new Response(body).json();
    } catch {
      body = null;
    }
  }

  return new Error(body?.error ?? `Request failed (${error.response.status})`);
}

api.interceptors.response.use(undefined, async (error: unknown) => {
  throw await toError(error);
});

export async function getPokemonPage(
  offset: number,
  limit: number,
  signal: AbortSignal,
): Promise<PokemonPage> {
  const { data } = await api.get<PokemonPage>("/pokemons", { params: { offset, limit }, signal });

  return data;
}

/**
 * Start a battle and yield each piece of the commentary as the backend streams it
 */
export async function* streamBattle(
  pokemonIds: number[],
  signal: AbortSignal,
): AsyncGenerator<string> {
  // Only axios' fetch adapter can hand over the body while it is still arriving
  const { data } = await api.post<ReadableStream<Uint8Array<ArrayBuffer>>>(
    "/battles",
    { pokemonIds },
    { adapter: "fetch", responseType: "stream", signal },
  );

  const reader = data.pipeThrough(new TextDecoderStream()).getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) return;
    yield value;
  }
}
