import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/main.ts"],
  format: ["cjs", "esm"],
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  dts: true,
  minify: Boolean(process.env.MINIFY),
  esbuildOptions: options => {
    options.mangleProps = /[^_]_$/;
    options.mangleCache = require("./mangle-cache.json");
  },
});
