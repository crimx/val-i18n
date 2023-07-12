import type { ReadonlyVal, Val } from "value-enhancer";
import { derive } from "value-enhancer";
import type {
  LocaleFetcher,
  LocaleLang,
  NestedLocale,
  NestedLocales,
  TFunction,
} from "./interface";
import type { FlatLocale } from "./flat-locales";
import type { LocaleTemplateMessageFns, TArgs } from "./template-message";

import { val, combine } from "value-enhancer";
import { flattenLocale } from "./flat-locales";
import { createTemplateMessageFn } from "./template-message";
import { insert } from "./utils";

export interface I18nOptions {
  fetcher: LocaleFetcher;
}

export class I18n {
  public static async load(
    initialLang: LocaleLang,
    fetcher: LocaleFetcher
  ): Promise<I18n> {
    return new I18n(
      initialLang,
      { [initialLang]: await fetcher(initialLang) },
      { fetcher }
    );
  }

  public readonly lang$: Val<LocaleLang>;
  public readonly t$: ReadonlyVal<TFunction>;
  public fetcher?: LocaleFetcher;

  private readonly nestedLocales$_: Val<NestedLocales>;
  private readonly flatLocale$_: ReadonlyVal<FlatLocale>;

  public constructor(
    initialLang: LocaleLang,
    locales: NestedLocales,
    options?: I18nOptions
  ) {
    if (options) {
      this.fetcher = options.fetcher;
    }

    this.nestedLocales$_ = val(locales);

    const localeFns: LocaleTemplateMessageFns = new Map();

    this.lang$ = val(initialLang);

    this.flatLocale$_ = combine(
      [this.lang$, this.nestedLocales$_],
      ([lang, nestedLocales]) => {
        if (!nestedLocales[lang]) {
          console.warn("Locale not found:", lang);
        }
        return flattenLocale(nestedLocales[lang] || {});
      }
    );

    this.t$ = derive(this.flatLocale$_, flatLocale => {
      localeFns.clear();

      return (key: string, args?: TArgs): string => {
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

  public get t(): TFunction {
    return this.t$.value;
  }

  public get lang(): LocaleLang {
    return this.lang$.value;
  }

  /** Change language */
  public async switchLang(lang: LocaleLang): Promise<void> {
    if (!this.nestedLocales$_.value[lang] && this.fetcher) {
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

  public addLocale(lang: LocaleLang, locale: NestedLocale): void {
    this.nestedLocales$_.set({
      ...this.nestedLocales$_.value,
      [lang]: locale,
    });
  }
}
