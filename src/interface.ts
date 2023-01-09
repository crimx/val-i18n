import type { ReadonlyVal } from "value-enhancer";

export type LocaleLang = string;

export type LocaleLangObservable = ReadonlyVal<LocaleLang>;

export type NestedLocale = { [key: string]: string | NestedLocale };

export type Locale = NestedLocale;

export type NestedLocales = Record<LocaleLang, NestedLocale>;

export type Locales = NestedLocales;

/**
 * t("Hello, {{name}}!", { name: "World" }) => "Hello, World!"
 */
export type TFunction = (key: string, args?: Record<string, string>) => string;

export type TFunctionObservable = ReadonlyVal<TFunction>;
