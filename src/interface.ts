import type { ReadonlyVal } from "value-enhancer";

export type LocaleLang = string;

export type LocaleLangObservable = ReadonlyVal<LocaleLang>;

export type Locale = { readonly [key: string]: string | Locale };

export type Locales = { readonly [lang: LocaleLang]: Locale };

/** Optional `args` object for t function */
export type TFunctionArgs = {
  readonly [key: string | number]: any;
  readonly [":option"]?: string | number;
};

/**
 * Get locale message by key-path(`"a.b.c"`) with optional arguments for interpolation
 * @returns locale message or empty string if not found
 */
export type TFunction = (keyPath: string, args?: TFunctionArgs) => string;

export type TFunctionObservable = ReadonlyVal<TFunction>;

export interface LocaleFetcher {
  (lang: LocaleLang): Promise<Locale>;
}
