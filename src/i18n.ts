import type { ReadonlyVal, Val } from "value-enhancer";
import type { LocaleLang, NestedLocales, TFunction } from "./interface";
import type { FlatLocale, FlatLocales } from "./flat-locales";
import type { LocaleTemplateMessageFn } from "./template-message";

import { val, combine } from "value-enhancer";
import { flattenLocale } from "./flat-locales";
import { createTemplateMessageFn } from "./template-message";
import { insert } from "./utils";

export class I18n {
  public readonly lang$: Val<LocaleLang>;
  public readonly t$: ReadonlyVal<TFunction>;

  private nestedLocales$_: Val<NestedLocales>;
  private flatLocales_: FlatLocales;
  private localeFns_: Map<LocaleLang, LocaleTemplateMessageFn>;

  public constructor(lang: LocaleLang, locales: NestedLocales) {
    this.nestedLocales$_ = val(locales);
    this.flatLocales_ = new Map();
    this.localeFns_ = new Map();

    this.lang$ = val(lang);

    this.t$ = combine([this.lang$, this.nestedLocales$_], ([lang]) => {
      const flatLocale = this.getFlatLocale_(lang);

      const localeFn =
        this.localeFns_.get(lang) || insert(this.localeFns_, lang, new Map());

      return (key: string, args?: Record<string, string>): string => {
        if (args) {
          const fn =
            localeFn.get(key) ||
            insert(
              localeFn,
              key,
              createTemplateMessageFn(flatLocale.get(key) || key)
            );
          return fn(args);
        }
        return flatLocale.get(key) || key;
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
   * @returns — boolean indicating whether a message with the specified key and language exists or not.
   */
  public hasMessage(key: string, lang = this.lang): boolean {
    return this.getFlatLocale_(lang).has(key);
  }

  /**
   * @returns — boolean indicating whether a locale pack with the specified language exists or not.
   */
  public hasLocale(lang: LocaleLang): boolean {
    return !!this.nestedLocales$_.value[lang];
  }

  public addLocales(locales: NestedLocales): void {
    for (const lang of Object.keys(locales)) {
      this.flatLocales_.delete(lang);
      this.localeFns_.delete(lang);
    }
    this.nestedLocales$_.set({ ...this.nestedLocales$_.value, ...locales });
  }

  private getFlatLocale_(lang: LocaleLang): FlatLocale {
    return (
      this.flatLocales_.get(lang) ||
      insert(
        this.flatLocales_,
        lang,
        flattenLocale(this.nestedLocales$_.value[lang])
      )
    );
  }
}
