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

export interface I18nOptions {
  /** Fetch locale of the specified lang. */
  fetcher: LocaleFetcher;
}

export class I18n {
  /** Fetch locale of `initialLang` and return an I18n instance with the locale. */
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
  public readonly lang$: ReadonlyVal<LocaleLang>;

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

  /** A Val of all loaded locales. */
  public readonly locales$: Val<Locales>;

  /** All loaded locales. */
  public get locales(): Locales {
    return this.locales$.value;
  }

  /** A Val of current locale. */
  public readonly locale$: ReadonlyVal<Locale>;

  /** Current locale */
  public get locale(): Locale {
    return this.locale$.value;
  }

  readonly #flatLocale$: ReadonlyVal<FlatLocale>;

  public constructor(
    initialLang: LocaleLang,
    locales: Locales,
    options?: I18nOptions
  ) {
    this.fetcher = options?.fetcher;

    const localeFns: LocaleTemplateMessageFns = new Map();

    this.locales$ = val(locales);

    this.lang$ = val(initialLang);

    this.locale$ = combine(
      [this.lang$, this.locales$],
      ([lang, nestedLocales]) => nestedLocales[lang] || {}
    );

    this.#flatLocale$ = derive(this.locale$, flattenLocale);

    this.t$ = derive(this.#flatLocale$, flatLocale => {
      localeFns.clear();

      return (key: string, args?: TFunctionArgs): string => {
        if (args) {
          const option = args[":option"];
          if (option != null) {
            const newKey = `${key}.${option}`;
            key = flatLocale[newKey] ? newKey : `${key}.other`;
          }
          let fn = localeFns.get(key);
          fn ||
            localeFns.set(
              key,
              (fn = createTemplateMessageFn(flatLocale[key] || key))
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
    (this.lang$ as Val<LocaleLang>).set(lang);
  }

  /**
   * @returns — boolean indicating whether a message with the specified key in current language exists or not.
   */
  public hasKey(key: string): boolean {
    return !!this.#flatLocale$.value[key];
  }

  /**
   * Add a locale to the locales.
   *
   * Use `i18n.locales$.set()` for more control.
   */
  public addLocale(lang: LocaleLang, locale: Locale): void {
    this.locales$.set({ ...this.locales, [lang]: locale });
  }

  public dispose(): void {
    this.lang$.dispose();
    this.t$.dispose();
    this.locales$.dispose();
    this.locale$.dispose();
    this.#flatLocale$.dispose();
  }
}
