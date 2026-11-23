import { createServer } from "node:http";

import { apiReference } from "@scalar/express-api-reference";
import axios from "axios";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";

import { BattleController } from "./controllers/BattleController.ts";
import { ContentController } from "./controllers/ContentsController.ts";
import { PokemonController } from "./controllers/PokemonController.ts";
import { openapi } from "./docs/openapi.ts";
import { HttpError } from "./utils/HttpError.ts";

const PORT = Number(process.env.PORT) || 3001;

/** App */
const app = express();

app.disable("x-powered-by");
const httpServer = createServer(app);

app.set("trust proxy", 1);
app.use(
  cors({
    origin: true,
    credentials: true,
    exposedHeaders: ["set-cookie"],
  }),
);

/**
 * Body parser
 */
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

/**
 * Routes
 */
app.use("/pokemons", PokemonController);
app.use("/contents", ContentController);
app.use("/battles", BattleController);

/**
 * @openapi
 * /ping:
 *   get:
 *     tags: [Health]
 *     summary: Health check
 *     responses:
 *       200:
 *         description: The server is up
 *         content:
 *           text/html:
 *             schema: { type: string, example: pong }
 */
app.get("/ping", (_req, res) => res.status(200).send("pong"));

/**
 * API documentation
 */
app.get("/openapi.json", (_req, res) => res.send(openapi));
app.use("/docs", apiReference({ url: "/openapi.json", agent: { disabled: true } }));

/**
 * Errors: every failure is answered as JSON, without leaking internals
 */
app.use((error: unknown, _req: Request, res: Response, next: NextFunction) => {
  // The answer has started (a battle being streamed): all that is left is to cut it
  if (res.headersSent) return next(error);

  if (error instanceof HttpError) {
    return res.status(error.status).send({ error: error.message });
  }
  if (axios.isAxiosError(error)) {
    return error.response?.status === 404
      ? res.status(404).send({ error: "Pokemon not found" })
      : res.status(502).send({ error: "PokeAPI could not be reached" });
  }

  console.error(error);
  return res.status(500).send({ error: "Internal server error" });
});

/* -------------------------- Start the application ------------------------- */

/**
 * Start server
 */
httpServer.listen(PORT, () => {
  console.log("Server started on port:", PORT);
});
