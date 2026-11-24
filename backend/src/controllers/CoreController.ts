import { type Request, type Response, Router } from "express";

const CoreController = Router();

/**
 * Health check
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
CoreController.get("/ping", (_req: Request, res: Response) => res.send("pong"));

export { CoreController };
