import { defineConfig } from "rolldown";

import { openapi } from "./src/docs/openapi.ts";

export default defineConfig({
  input: "src/server.ts",
  platform: "node",
  plugins: [
    {
      name: "inline-openapi",
      load: (id) =>
        id.endsWith("/src/docs/openapi.ts")
          ? `export const openapi = ${JSON.stringify(openapi)};`
          : null,
    },
  ],
  output: {
    file: "dist/app.js",
    minify: true,
  },
});
