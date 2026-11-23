import { createServer } from "node:http";

import { apiReference } from "@scalar/express-api-reference";
import cors from "cors";
import express from "express";

import { ContentController } from "./controllers/ContentsController.ts";
import { PokemonController } from "./controllers/PokemonController.ts";
import { openapi } from "./docs/openapi.ts";

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

/* -------------------------- Start the application ------------------------- */

/**
 * Start server
 */
httpServer.listen(3001, () => {
  console.log("Server started on port:", 3001);
});
