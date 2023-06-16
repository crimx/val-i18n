import type { ReadonlyVal } from "value-enhancer";
import type { I18n } from "./i18n";
import type { TArgs } from "./template-message";

export type LocaleLang = string;

export type LocaleLangObservable = ReadonlyVal<LocaleLang>;

export type NestedLocale = { [key: string]: string | NestedLocale };

export type Locale = NestedLocale;

export type NestedLocales = Record<LocaleLang, NestedLocale>;

export type Locales = NestedLocales;

export type TFunctionArgs = TArgs & {
  [":option"]?: string | number;
};

/**
 * Get locale message by key-path(`"a.b.c"`) with optional arguments for interpolation
 * @returns locale message or empty string if not found
 */
export type TFunction = (keyPath: string, args?: TFunctionArgs) => string;

export type TFunctionObservable = ReadonlyVal<TFunction>;

/**
 * Pick a key based on args.
 * @param key - `key` from `i18n.t`
 * @param args - `args` from `i18n.t`
 * @param i18n - `i18n` instance
 * @returns a new key or `undefined` | `null` to skip this picker
 */
export interface I18nKeyPicker {
  (key: string, args: Record<string, any>, i18n: I18n):
    | string
    | undefined
    | null;
}

export interface I18nKeyPickerPlugin {
  (nestedLocale: NestedLocale, i18n: I18n): I18nKeyPicker;
}

export interface LocaleFetcher {
  (lang: LocaleLang): Promise<NestedLocale>;
}
