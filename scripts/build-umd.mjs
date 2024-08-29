import { rollup } from "rollup";

const bundle = await rollup({
  input: ["dist/main.mjs"],
  external: ["value-enhancer"],
});

await bundle.write({
  format: "umd",
  file: "dist/main.umd.js",
  name: "ValI18n",
  globals: {
    "value-enhancer": "ValueEnhancer",
  },
});
