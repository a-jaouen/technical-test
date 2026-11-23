import { defineConfig } from "rolldown";

import { openapi } from "./src/docs/openapi.ts";

/** Bundle the server and all its dependencies into a single minified ESM file */
export default defineConfig({
  input: "src/app.ts",
  platform: "node",
  plugins: [
    {
      // swagger-jsdoc reads the source comments, which the bundle no longer has: inline its output
      name: "inline-openapi",
      load: (id) =>
        id.endsWith("/src/docs/openapi.ts")
          ? `export const openapi = ${JSON.stringify(openapi)};`
          : null,
    },
  ],
  output: {
    file: "dist/app.js",
    format: "esm",
    minify: true,
    sourcemap: false,
  },
});
