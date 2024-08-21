/**
 * Get browser/nodejs language
 *
 * @returns BCP 47 tags of the browser/nodejs language
 */
export function detectLang(): string;
/**
 * Get browser/nodejs language that matches the given language tags
 *
 * @param langs The language tags to match (BCP 47 tags and sub-tags are supported)
 * @returns The first language tag that matches the browser/nodejs language, or `null` if no match
 *
 * @example
 * ```js
 * detectLang(["en", "zh-CN"]) || "zh-TW"
 * ```
 */
export function detectLang<T extends string>(langs: readonly T[]): T | null;
export function detectLang(langs: readonly string[]): string | null;
export function detectLang(langs?: readonly string[]): string | null {
  const locale = Intl.DateTimeFormat().resolvedOptions().locale;

  if (langs) {
    // BCP 47 tags are case-insensitive
    const lowerCaseLocale = locale.toLowerCase();
    for (const lang of langs) {
      if (lowerCaseLocale.startsWith(lang.toLowerCase())) {
        return lang;
      }
    }
    return null;
  }

  return locale;
}
