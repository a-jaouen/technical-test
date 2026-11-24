import { Readable } from "node:stream";

import axios, { type InternalAxiosRequestConfig } from "axios";

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

/** Word a failed request for the user: `refusal` when the chatbot answered with an error status */
const toChatbotError = (error: unknown, refusal: string): HttpError => {
  // A failed login, already worded
  if (error instanceof HttpError) return error;
  if (axios.isAxiosError(error) && error.response)
    return new HttpError(502, `${refusal} (${error.response.status})`);
  // Also reached when the caller aborts: it knows it did, and ignores this error
  return new HttpError(502, "The chatbot could not be reached");
};

/** Exchange the API key for a short-lived access token, which also tells which chatbot the key belongs to */
async function login(): Promise<Session> {
  const apiKey = process.env.CHATBOT_API_KEY;
  if (!apiKey) throw new HttpError(500, "The chatbot API key (CHATBOT_API_KEY) is not set");

  try {
    const {
      data: { accessToken, chatbotId, expiresIn },
    } = await axios.post<TokenResponse>(
      `${CHATBOT_API_URL}/auth/api-key/token`,
      { apiKey },
      { timeout: LOGIN_TIMEOUT },
    );

    // Renew a minute early, so a token never expires in the middle of a request
    return { accessToken, chatbotId, expiresAt: Date.now() + (expiresIn - 60) * 1000 };
  } catch (error) {
    throw toChatbotError(error, "The chatbot refused the API key");
  }
}

let session: Promise<Session> | undefined;

/** Log in once and reuse the token until it expires */
async function getSession(): Promise<Session> {
  const pending = session;
  try {
    const current = await pending;
    if (current && current.expiresAt > Date.now()) return current;
  } catch {
    // The previous login failed: try again below
  }

  // Unless a concurrent call already logged in again while this one was waiting
  if (!session || session === pending) session = login();
  return session;
}

/** Requests to the chatbot, authenticated by the interceptors below */
const chatbot = axios.create({ baseURL: CHATBOT_API_URL });

interface ChatbotRequestConfig extends InternalAxiosRequestConfig {
  /** Set once the request was sent again after a 401 */
  retried?: boolean;
}

chatbot.interceptors.request.use(async (config) => {
  const { accessToken } = await getSession();
  config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

chatbot.interceptors.response.use(undefined, async (error: unknown) => {
  const response = axios.isAxiosError(error) ? error.response : undefined;
  // Nothing is read from a refusal: release its connection
  if (response?.data instanceof Readable) response.data.destroy();

  const config: ChatbotRequestConfig | undefined = response?.config;
  if (response?.status === 401 && config && !config.retried) {
    // The token was revoked before its expiry: log in again and ask once more
    session = undefined;
    config.retried = true;
    return chatbot.request(config);
  }

  throw toChatbotError(error, "The chatbot could not answer");
});

/**
 * Ask the Virtual Brain chatbot and yield its answer as it is streamed.
 * Each call opens a new chatbot session: battles do not share any history.
 */
export async function* askChatbot(query: string, signal: AbortSignal): AsyncGenerator<string> {
  const { chatbotId } = await getSession();

  const { data } = await chatbot.post<Readable>(
    `/open-completion/${chatbotId}/query`,
    { query },
    { responseType: "stream", signal },
  );

  data.setEncoding("utf8");
  yield* data;
}
