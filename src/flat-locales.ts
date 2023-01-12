import type { NestedLocale } from "./interface";

export type FlatLocales = Map<string, string>;

/**
 * Turns a nested locale object into a flat locale object.
 */
export const flattenLocale = (
  locale: NestedLocale = {},
  flatLocale: FlatLocales = new Map(),
  prefix = ""
): FlatLocales => {
  for (const [key, value] of Object.entries(locale)) {
    if (typeof value === "string") {
      flatLocale.set(prefix + key, value);
    } else {
      flattenLocale(value, flatLocale, prefix + key + ".");
    }
  }
  return flatLocale;
};
