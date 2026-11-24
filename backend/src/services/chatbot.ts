import { Readable } from "node:stream";

import axios, { type InternalAxiosRequestConfig } from "axios";

import { toRequestError } from "../utils/helpers.ts";

const CHATBOT_API_URL = "https://chatbot-api.getvirtualbrain.com/v1";
const LOGIN_TIMEOUT = 10_000;
// How long the chatbot may stay silent before it starts answering
const ANSWER_TIMEOUT = 60_000;

interface Session {
  accessToken: string;
  refreshToken: string;
  chatbotId: string;
  expiresAt: number;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  chatbotId: string;
  expiresIn: number;
}

/**
 * Ask the chatbot API for a token pair, kept as a session renewed a minute before its access token expires
 * @param path - Authentication route to call
 * @param body - Credentials sent to that route
 */
async function requestSession(path: string, body: object): Promise<Session> {
  try {
    const {
      data: { accessToken, refreshToken, chatbotId, expiresIn },
    } = await axios.post<TokenResponse>(`${CHATBOT_API_URL}${path}`, body, {
      timeout: LOGIN_TIMEOUT,
    });

    return {
      accessToken,
      refreshToken,
      chatbotId,
      expiresAt: Date.now() + (expiresIn - 60) * 1000,
    };
  } catch (error) {
    throw toRequestError(error);
  }
}

/**
 * Open a session with the API key
 */
async function login(): Promise<Session> {
  const apiKey = process.env.CHATBOT_API_KEY;
  if (!apiKey) throw new Error("The chatbot API key (CHATBOT_API_KEY) is not set");

  return requestSession("/auth/api-key/token", { apiKey });
}

/**
 * Renew a session with its refresh token, or log in again when the refresh token is refused
 * @param previous - Session whose access token is no longer valid
 */
async function refresh({ refreshToken, chatbotId }: Session): Promise<Session> {
  try {
    return await requestSession("/auth/api-key/refresh", { refreshToken, chatbotId });
  } catch {
    return login();
  }
}

let session: Promise<Session> | undefined;

/**
 * Return the current session, logging in once and refreshing it when its access token is no longer valid
 * @param rejectedToken - Access token the chatbot refused before its expiry, if any
 */
async function getSession(rejectedToken?: string): Promise<Session> {
  const pending = session;
  let current: Session | undefined;
  try {
    current = await pending;
  } catch {
    current = undefined;
  }
  if (current && current.expiresAt > Date.now() && current.accessToken !== rejectedToken)
    return current;

  if (!session || session === pending) session = current ? refresh(current) : login();
  return session;
}

const chatbot = axios.create({ baseURL: CHATBOT_API_URL, timeout: ANSWER_TIMEOUT });

interface ChatbotRequestConfig extends InternalAxiosRequestConfig {
  accessToken?: string;
  retried?: boolean;
}

chatbot.interceptors.request.use(async (config: ChatbotRequestConfig) => {
  const { accessToken } = await getSession();
  config.accessToken = accessToken;
  config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

chatbot.interceptors.response.use(undefined, async (error: unknown) => {
  const response = axios.isAxiosError(error) ? error.response : undefined;
  if (response?.data instanceof Readable) response.data.destroy();

  const config: ChatbotRequestConfig | undefined = response?.config;
  if (response?.status === 401 && config && !config.retried) {
    await getSession(config.accessToken);
    config.retried = true;
    return chatbot.request(config);
  }

  throw toRequestError(error);
});

/**
 * Ask the Virtual Brain chatbot, in a new chatbot session, and yield its answer as it is streamed
 * @param query - Message sent to the chatbot
 * @param signal - Aborts the request when the client leaves
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
