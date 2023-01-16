import type { ReadonlyVal, Val } from "value-enhancer";
import { derive } from "value-enhancer";
import type { LocaleLang, NestedLocales, TFunction } from "./interface";
import type { FlatLocales } from "./flat-locales";
import type { LocaleTemplateMessageFns } from "./template-message";

import { val, combine } from "value-enhancer";
import { flattenLocale } from "./flat-locales";
import { createTemplateMessageFn } from "./template-message";
import { insert } from "./utils";

export class I18n {
  public readonly lang$: Val<LocaleLang>;
  public readonly t$: ReadonlyVal<TFunction>;

  private readonly nestedLocales$_: Val<NestedLocales>;
  private readonly flatLocales_: FlatLocales;
  private readonly localeFns_: LocaleTemplateMessageFns;

  public constructor(lang: LocaleLang, locales: NestedLocales) {
    this.nestedLocales$_ = val(locales);
    this.flatLocales_ = new Map();
    this.localeFns_ = new Map();

    this.lang$ = val(lang);

    const currentNestedLocale$ = combine(
      [this.lang$, this.nestedLocales$_],
      ([lang, nestedLocales]) => nestedLocales[lang]
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
              createTemplateMessageFn(this.flatLocales_.get(key) || "")
            );
          return fn(args);
        }
        return this.flatLocales_.get(key) || "";
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
  public setLang(lang: LocaleLang): void {
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

  /**
   * @returns — boolean indicating whether a locale pack of the specified language exists or not.
   */
  public hasLocale(lang: LocaleLang): boolean {
    return !!this.nestedLocales$_.value[lang];
  }

  public addLocales(locales: NestedLocales): void {
    this.nestedLocales$_.set({ ...this.nestedLocales$_.value, ...locales });
  }
}
