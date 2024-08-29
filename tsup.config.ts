import { defineConfig } from "tsup";
import mangleCache from "./mangle-cache.json";

export default defineConfig({
  entry: ["src/main.ts"],
  format: ["cjs", "esm"],
  target: "esnext",
  splitting: false,
  sourcemap: false,
  clean: true,
  treeshake: true,
  dts: true,
  minify: Boolean(process.env.MINIFY),
  esbuildOptions: options => {
    options.mangleProps = /[^_]_$/;
    options.mangleCache = mangleCache;
  },
});
