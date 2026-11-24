import { apiReference } from "@scalar/express-api-reference";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";

import { BattleController } from "./controllers/BattleController.ts";
import { ContentController } from "./controllers/ContentsController.ts";
import { CoreController } from "./controllers/CoreController.ts";
import { PokemonController } from "./controllers/PokemonController.ts";
import { openapi } from "./docs/openapi.ts";
import { HttpError } from "./utils/HttpError.ts";

/** App */
const app = express();

app.disable("x-powered-by");

app.use(cors());

/**
 * Body parser
 */
// The only body is a handful of pokemon ids: the default limit (100 KB) is plenty
app.use(express.json());

/**
 * Routes
 */
app.use("/", CoreController);
app.use("/pokemons", PokemonController);
app.use("/contents", ContentController);
app.use("/battles", BattleController);

/**
 * API documentation
 */
app.get("/openapi.json", (_req, res) => res.send(openapi));
app.use("/docs", apiReference({ url: "/openapi.json", agent: { disabled: true } }));

/**
 * Unknown routes
 */
app.use((_req, res) => res.status(404).send({ error: "Not found" }));

/**
 * Errors: every failure is answered as JSON, without leaking internals
 */
app.use((error: unknown, _req: Request, res: Response, next: NextFunction) => {
  // The answer has started (a battle being streamed): all that is left is to cut it
  if (res.headersSent) return next(error);

  if (error instanceof HttpError) {
    return res.status(error.status).send({ error: error.message });
  }
  // Errors raised by the body parsers (malformed JSON, body too large) are the client's fault
  if (error instanceof Error && "expose" in error && error.expose === true && "status" in error) {
    return res.status(Number(error.status)).send({ error: error.message });
  }

  console.error(error);
  return res.status(500).send({ error: "Internal server error" });
});

export { app };
