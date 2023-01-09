import type { LocaleLang, NestedLocale } from "./interface";

export type FlatLocale = Map<string, string>;

export type FlatLocales = Map<LocaleLang, FlatLocale>;

/**
 * Turns a nested locale object into a flat locale object.
 */
export const flattenLocale = (
  locale: NestedLocale = {},
  flatLocale: FlatLocale = new Map(),
  prefix = ""
): FlatLocale => {
  for (const [key, value] of Object.entries(locale)) {
    if (typeof value === "string") {
      flatLocale.set(prefix + key, value);
    } else {
      flattenLocale(value, flatLocale, prefix + key + ".");
    }
  }
  return flatLocale;
};
