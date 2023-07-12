import type { ReadonlyVal, Val } from "value-enhancer";
import { derive } from "value-enhancer";
import type {
  LocaleFetcher,
  LocaleLang,
  Locale,
  Locales,
  TFunction,
  TFunctionArgs,
} from "./interface";
import type { FlatLocale } from "./flat-locales";
import type { LocaleTemplateMessageFns } from "./template-message";

import { val, combine } from "value-enhancer";
import { flattenLocale } from "./flat-locales";
import { createTemplateMessageFn } from "./template-message";
import { insert } from "./utils";

export interface I18nOptions {
  /** Fetch locale of the specified lang. */
  fetcher: LocaleFetcher;
}

export class I18n {
  /** Fetch locale of initialLang and return an I18n instance with the locale. */
  public static async preload(
    initialLang: LocaleLang,
    fetcher: LocaleFetcher
  ): Promise<I18n> {
    return new I18n(
      initialLang,
      { [initialLang]: await fetcher(initialLang) },
      { fetcher }
    );
  }

  /** A Val of current lang. */
  public readonly lang$: Val<LocaleLang>;

  /** Current lang. */
  public get lang(): LocaleLang {
    return this.lang$.value;
  }

  /** A Val of current translate function. */
  public readonly t$: ReadonlyVal<TFunction>;

  /** Current translate function. */
  public get t(): TFunction {
    return this.t$.value;
  }

  /** Fetch locale of the specified lang. */
  public fetcher?: LocaleFetcher;

  /** A Val of loaded locales. */
  public readonly locales$: Val<Locales>;

  /** Loaded locales. */
  public get locales(): Locales {
    return this.locales$.value;
  }

  private readonly flatLocale$_: ReadonlyVal<FlatLocale>;

  public constructor(
    initialLang: LocaleLang,
    locales: Locales,
    options?: I18nOptions
  ) {
    if (options) {
      this.fetcher = options.fetcher;
    }

    this.locales$ = val(locales);

    const localeFns: LocaleTemplateMessageFns = new Map();

    this.lang$ = val(initialLang);

    this.flatLocale$_ = combine(
      [this.lang$, this.locales$],
      ([lang, nestedLocales]) => {
        if (!nestedLocales[lang]) {
          console.warn("Locale not found:", lang);
        }
        return flattenLocale(nestedLocales[lang] || {});
      }
    );

    this.t$ = derive(this.flatLocale$_, flatLocale => {
      localeFns.clear();

      return (key: string, args?: TFunctionArgs): string => {
        if (args) {
          const option = args[":option"];
          if (option != null) {
            const newKey = `${key}.${option}`;
            key = flatLocale[newKey] ? newKey : `${key}.other`;
          }
          const fn =
            localeFns.get(key) ||
            insert(
              localeFns,
              key,
              createTemplateMessageFn(flatLocale[key] || key)
            );
          return fn(args);
        }
        return flatLocale[key] || key;
      };
    });
  }

  /**
   * Change language.
   *
   * @returns — a promise that resolves when the new locale is fetched.
   */
  public async switchLang(lang: LocaleLang): Promise<void> {
    if (!this.locales$.value[lang] && this.fetcher) {
      this.addLocale(lang, await this.fetcher(lang));
    }
    this.lang$.set(lang);
  }

  /**
   * @returns — boolean indicating whether a message with the specified key in current language exists or not.
   */
  public hasKey(key: string): boolean {
    return !!this.flatLocale$_.value[key];
  }

  /**
   * Add a locale to the locales.
   *
   * Use `i18n.locales$.set()` for more control.
   */
  public addLocale(lang: LocaleLang, locale: Locale): void {
    this.locales$.set({ ...this.locales, [lang]: locale });
  }
}
