import type { ReadonlyVal, Val } from "value-enhancer";
import { derive } from "value-enhancer";
import type {
  LocaleFetcher,
  LocaleLang,
  NestedLocales,
  TFunction,
} from "./interface";
import type { FlatLocales } from "./flat-locales";
import type { LocaleTemplateMessageFns } from "./template-message";

import { val, combine } from "value-enhancer";
import { flattenLocale } from "./flat-locales";
import { createTemplateMessageFn } from "./template-message";
import { insert } from "./utils";

export interface I18nOptions {
  fetcher: LocaleFetcher;
}

export class I18n {
  public static async load(
    lang: LocaleLang,
    fetcher: LocaleFetcher
  ): Promise<I18n> {
    return new I18n(lang, { [lang]: await fetcher(lang) }, { fetcher });
  }

  public readonly lang$: Val<LocaleLang>;
  public readonly t$: ReadonlyVal<TFunction>;
  public fetcher?: LocaleFetcher;

  private readonly nestedLocales$_: Val<NestedLocales>;
  private readonly flatLocales_: FlatLocales;
  private readonly localeFns_: LocaleTemplateMessageFns;

  public constructor(
    lang: LocaleLang,
    locales: NestedLocales,
    options?: I18nOptions
  ) {
    if (options) {
      this.fetcher = options.fetcher;
    }

    this.nestedLocales$_ = val(locales);
    this.flatLocales_ = new Map();
    this.localeFns_ = new Map();

    this.lang$ = val(lang);

    const currentNestedLocale$ = combine(
      [this.lang$, this.nestedLocales$_],
      ([lang, nestedLocales]) => {
        if (!nestedLocales[lang]) {
          console.warn("Locale not found:", lang);
        }
        return nestedLocales[lang] || {};
      }
    );

    this.t$ = derive(currentNestedLocale$, currentNestedLocale => {
      this.flatLocales_.clear();
      this.localeFns_.clear();

      flattenLocale(currentNestedLocale, this.flatLocales_);

      return (key: string, args?: Record<string, string>): string => {
        if (args) {
          const option = args[":option"];
          if (option != null) {
            const newKey = `${key}.${option}`;
            key = this.flatLocales_.has(newKey) ? newKey : `${key}.other`;
          }
          const fn =
            this.localeFns_.get(key) ||
            insert(
              this.localeFns_,
              key,
              createTemplateMessageFn(this.flatLocales_.get(key) || key)
            );
          return fn(args);
        }
        return this.flatLocales_.get(key) || key;
      };
    });
  }

  public get t(): TFunction {
    return this.t$.value;
  }

  public get lang(): LocaleLang {
    return this.lang$.value;
  }

  /** Change language */
  public async switchLang(lang: LocaleLang): Promise<void> {
    if (!this.nestedLocales$_.value[lang] && this.fetcher) {
      this.nestedLocales$_.set({
        ...this.nestedLocales$_.value,
        [lang]: await this.fetcher(lang),
      });
    }
    this.lang$.set(lang);
  }

  /** Get all loaded locale languages */
  public langs(): LocaleLang[] {
    return Object.keys(this.nestedLocales$_.value);
  }

  /**
   * @returns — boolean indicating whether a message with the specified key in current language exists or not.
   */
  public hasKey(key: string): boolean {
    return this.flatLocales_.has(key);
  }

  public addLocales(locales: NestedLocales): void {
    this.nestedLocales$_.set({ ...this.nestedLocales$_.value, ...locales });
  }
}
