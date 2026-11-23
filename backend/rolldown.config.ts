import { defineConfig } from "rolldown";

/** Bundle the server and all its dependencies into a single minified ESM file */
export default defineConfig({
  input: "src/app.ts",
  platform: "node",
  output: {
    file: "dist/app.js",
    format: "esm",
    minify: true,
    sourcemap: false,
  },
});
