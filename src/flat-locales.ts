import type { NestedLocale } from "./interface";

export type FlatLocale = Record<string, string>;

/**
 * Turns a nested locale object into a flat locale object.
 */
export const flattenLocale = (
  locale: NestedLocale,
  flatLocale: FlatLocale = {},
  prefix = ""
): FlatLocale => {
  for (const [key, value] of Object.entries(locale)) {
    if (typeof value === "string") {
      flatLocale[prefix + key] = value;
    } else {
      flattenLocale(value, flatLocale, prefix + key + ".");
    }
  }
  return flatLocale;
};
