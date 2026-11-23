import { HttpError } from "../utils/HttpError.ts";

const CHATBOT_API_URL = "https://chatbot-api.getvirtualbrain.com/v1";
const LOGIN_TIMEOUT = 10_000;

interface Session {
  accessToken: string;
  chatbotId: string;
  expiresAt: number;
}

interface TokenResponse {
  accessToken: string;
  chatbotId: string;
  /** Lifetime of the access token, in seconds */
  expiresIn: number;
}

const post = async (path: string, body: object, init: RequestInit): Promise<Response> => {
  try {
    return await fetch(`${CHATBOT_API_URL}${path}`, {
      ...init,
      method: "POST",
      headers: { ...init.headers, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (error) {
    // The caller gave up (the user left the arena): not a chatbot failure
    if (init.signal?.aborted) throw error;
    throw new HttpError(502, "The chatbot could not be reached");
  }
};

/** Exchange the API key for a short-lived access token, which also tells which chatbot the key belongs to */
async function login(): Promise<Session> {
  const apiKey = process.env.CHATBOT_API_KEY;
  if (!apiKey) throw new HttpError(500, "The chatbot API key (CHATBOT_API_KEY) is not set");

  const response = await post(
    "/auth/api-key/token",
    { apiKey },
    { signal: AbortSignal.timeout(LOGIN_TIMEOUT) },
  );
  if (!response.ok)
    throw new HttpError(502, `The chatbot refused the API key (${response.status})`);

  const { accessToken, chatbotId, expiresIn } = (await response.json()) as TokenResponse;

  // Renew a minute early, so a token never expires in the middle of a request
  return { accessToken, chatbotId, expiresAt: Date.now() + (expiresIn - 60) * 1000 };
}

let session: Promise<Session> | undefined;

/** Log in once and reuse the token until it expires */
async function getSession(): Promise<Session> {
  try {
    const current = await session;
    if (current && current.expiresAt > Date.now()) return current;
  } catch {
    // The previous login failed: try again below
  }

  session = login();
  return session;
}

/**
 * Ask the Virtual Brain chatbot and yield its answer as it is streamed.
 * Each call opens a new chatbot session: battles do not share any history.
 */
export async function* askChatbot(query: string, signal: AbortSignal): AsyncGenerator<string> {
  const { accessToken, chatbotId } = await getSession();

  const response = await post(
    `/open-completion/${chatbotId}/query`,
    { query },
    { headers: { Authorization: `Bearer ${accessToken}` }, signal },
  );
  // The token was revoked before its expiry: log in again on the next call
  if (response.status === 401) session = undefined;
  if (!response.ok || !response.body) {
    throw new HttpError(502, `The chatbot could not answer (${response.status})`);
  }

  const decoder = new TextDecoder();
  for await (const chunk of response.body) {
    yield decoder.decode(chunk, { stream: true });
  }
}
