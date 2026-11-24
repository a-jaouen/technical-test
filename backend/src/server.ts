import { createServer } from "node:http";

import { app } from "./app.ts";

const PORT = Number(process.env.PORT) || 3001;

/**
 * Start server
 */
const server = createServer(app).listen(PORT, () => {
  console.log("Server started on port:", PORT);
});

/**
 * Stop on SIGTERM and SIGINT: as PID 1 in the container, node ignores them unless they are handled
 */
const stop = () => {
  server.close(() => process.exit(0));
  server.closeAllConnections();
};
process.on("SIGTERM", stop);
process.on("SIGINT", stop);
