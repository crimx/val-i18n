import type { ReadonlyVal, Val } from "value-enhancer";
import type { LocaleLang, NestedLocales, TFunction } from "./interface";
import type { FlatLocale, FlatLocales } from "./flat-locales";
import type { LocaleTemplateMessageFn } from "./template-message";

import { val, derive, combine } from "value-enhancer";
import { flattenLocale } from "./flat-locales";
import { createTemplateMessageFn } from "./template-message";
import { insert } from "./utils";

export interface I18nConfig<TLang extends LocaleLang = LocaleLang> {
  /** current locale language */
  lang: TLang;
  locales: NestedLocales;
}

export class I18n<TLang extends LocaleLang = LocaleLang> {
  public readonly lang$: Val<TLang>;
  public readonly t$: ReadonlyVal<TFunction>;

  private nestedLocales$_: Val<NestedLocales>;
  private flatLocales_: FlatLocales;
  private localeFns_: WeakMap<FlatLocale, LocaleTemplateMessageFn>;

  public constructor({ lang, locales }: I18nConfig<TLang>) {
    this.nestedLocales$_ = val(locales);
    this.flatLocales_ = new Map();
    this.localeFns_ = new WeakMap();

    this.lang$ = val(lang);

    const flatLocale$: ReadonlyVal<FlatLocale> = combine(
      [this.lang$, this.nestedLocales$_],
      ([lang, nestedLocales]) =>
        this.flatLocales_.get(lang) ||
        insert(this.flatLocales_, lang, flattenLocale(nestedLocales[lang]))
    );

    this.t$ = derive(flatLocale$, flatLocale => {
      const localeFn =
        this.localeFns_.get(flatLocale) ||
        insert(this.localeFns_, flatLocale, new Map());

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

  public setLang(lang: TLang): void {
    this.lang$.set(lang);
  }

  public addLocales(locales: NestedLocales): void {
    for (const lang of Object.keys(locales)) {
      this.flatLocales_.delete(lang);
    }
    this.nestedLocales$_.set({ ...this.nestedLocales$_.value, ...locales });
  }
}
