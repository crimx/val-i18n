# [val-i18n](https://github.com/crimx/val-i18n)

<p align="center">
  <img width="200" src="https://raw.githubusercontent.com/crimx/val-i18n/main/assets/val-i18n.svg">
</p>

[![Build Status](https://github.com/crimx/val-i18n/actions/workflows/build.yml/badge.svg)](https://github.com/crimx/val-i18n/actions/workflows/build.yml)
[![npm-version](https://img.shields.io/npm/v/val-i18n.svg)](https://www.npmjs.com/package/val-i18n)
[![Coverage Status](https://img.shields.io/coveralls/github/crimx/val-i18n/master)](https://coveralls.io/github/crimx/val-i18n?branch=master)
[![minified-size](https://img.shields.io/bundlephobia/minzip/val-i18n)](https://bundlephobia.com/package/val-i18n)

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?maxAge=2592000)](http://commitizen.github.io/cz-cli/)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-brightgreen.svg?maxAge=2592000)](https://conventionalcommits.org)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

Reactive i18n with val-i18n.

## Install

```bash
npm add val-i18n value-enhancer
```

## Features

- Subscribable reactive `lang$`, `t$` and `locales$`.
- Lightweight and fast `t()` translation.
- Nested locale messages.
- Message formatting and pluralization.
- Easy dynamic locale loading.
- Locale namespaces.
- Framework integration friendly ([React, Svelte, etc.](#reactive-i18n)).

## Usage

Create an I18n instance with static locales:

```ts
import { I18n, type Locales } from "val-i18n";

const locales: Locales = {
  en: {
    stock: {
      fruit: "apple",
    },
  },
};

const i18n = new I18n("en", locales);
i18n.t("stock.fruit"); // apple

// add more locales later
const zhCN = await import(`./locales/zh-CN.json`);
i18n.addLocale("zh-CN", zhCN);

// or replace all locales manually
const zhTW = await import(`./locales/zh-TW.json`);
i18n.locales$.set({ "zh-TW": zhTW });
```

You can also create an I18n instance with preloaded dynamic locales:

```ts
import { I18n } from "val-i18n";

const i18n = await I18n.preload("en", lang => import(`./locales/${lang}.json`));
// Locale `./locales/en.json` is preloaded

await i18n.switchLang("zh-CN"); // Locale `./locales/zh-CN.json` is loaded
```

### Detect Language

You can detect language of browser/nodejs via `detectLang`. [BCP 47 tags and sub-tags](https://www.rfc-editor.org/rfc/rfc4647.html#section-3.4) are supported.

```ts
import { detectLang } from "val-i18n";

detectLang(); // "en-US"

const i18n = await I18n.preload(
  // language sub-tag is matched
  detectLang(["en", "zh-CN"]) || "zh-TW", // "en"
  lang => import(`./locales/${lang}.json`)
);
```

### Message Formatting

Message keys are surrounded by double curly brackets:

```ts
import { I18n, type Locales } from "val-i18n";

const locales: Locales = {
  en: {
    stock: {
      fruit: "apple",
    },
    fav_fruit: "I love {{fruit}}",
  },
};

const i18n = new I18n("en", locales);
const fruit = i18n.t("stock.fruit"); // apple
i18n.t("fav_fruit", { fruit }); // I love apple
```

It also works with array:

```ts
import { I18n, type Locales } from "val-i18n";

const locales: Locales = {
  en: {
    fav_fruit: "I love {{0}} and {{1}}",
  },
};

const i18n = new I18n("en", locales);
i18n.t("fav_fruit", ["apple", "banana"]); // I love apple and banana
```

### Pluralization

Message formatting supports a special key `:option` whose value will be appended to the key-path.

For example:

```ts
i18n.t("a.b.c", { ":option": "d" });
```

It will look for `"a.b.c.d"` and fallback to `"a.b.c.other"` if not found.

So for pluralization we can simply use `:option` as number count.

```ts
import { I18n, type Locales } from "val-i18n";

const locales: Locales = {
  en: {
    apples: {
      0: "No apple",
      1: "An apple",
      other: "{{:option}} apples",
    },
  },
};

const i18n = new I18n("en", locales);
i18n.t("apples", { ":option": 0 }); // No apple
i18n.t("apples", { ":option": 1 }); // An apple
i18n.t("apples", { ":option": 3 }); // 3 apples
```

### Reactive I18n

`i18n.lang$`, `i18n.t$` and `i18n.locales$` are subscribable values.

See [value-enhancer](https://github.com/crimx/value-enhancer#value-enhancer) for more details.

```js
i18n.lang$.reaction(lang => {
  // logs lang on changed
  console.log(lang);
});

i18n.lang$.subscribe(lang => {
  // logs lang immediately and on changed
  console.log(lang);
});
```

### Namespace

I18n instance is cheap to create. You can create multiple instances for different namespaces.

```ts
import { I18n } from "val-i18n";

// Module Login
async function moduleLogin() {
  const i18n = await I18n.preload(
    "en",
    lang => import(`./locales/login/${lang}.json`)
  );

  console.log(i18n.t("password"));
}

// Module About
async function moduleAbout() {
  const i18n = await I18n.preload(
    "en",
    lang => import(`./locales/about/${lang}.json`)
  );

  console.log(i18n.t("author"));
}
```

## Hot Module Replacement

To use [Vite HMR](https://vitejs.dev/guide/api-hmr.html) for locales:

```ts
const i18n = await I18n.preload("en", lang => import(`./locales/${lang}.json`));

if (import.meta.hot) {
  import.meta.hot.accept(
    ["./locales/en.json", "./locales/zh-CN.json"],
    ([en, zhCN]) => {
      i18n.locales$.set({
        ...i18n.locales,
        en: en?.default || i18n.locales.en,
        "zh-CN": zhCN?.default || i18n.locales["zh-CN"],
      });
    }
  );
}
```

## Dynamic Import

Although you can simply use `import()` to dynamically load locales, with bundler API you can do more.

For example with Vite you can use [glob import](https://vitejs.dev/guide/features.html#glob-import) to statically get info of all locales.
This way allows you to add or remove locales without changing source code.

```ts
import { I18n, detectLang, type Locale, type LocaleLang } from "val-i18n";

export const i18nLoader = (): Promise<I18n> => {
  const localeModules = import.meta.glob<boolean, string, Locale>(
    "./locales/*.json",
    { import: "default" }
  );

  const localeLoaders = Object.keys(localeModules).reduce((loaders, path) => {
    if (localeModules[path]) {
      const langMatch = path.match(/\/([^/]+)\.json$/);
      if (langMatch) {
        loaders[langMatch[1]] = localeModules[path];
      }
    }
    return loaders;
  }, {} as Record<LocaleLang, () => Promise<Locale>>);

  const langs = Object.keys(localeLoaders);

  return I18n.preload(
    detectLang(langs) || (localeLoaders.en ? "en" : langs[0]),
    lang => localeLoaders[lang]()
  );
};
```

## Framework Integration

### Svelte

In Svelte you can just pass `i18n.t$` as component props and use `$t` directly.

```html
<script>
  export let t;
</script>

<div>
  <h1>{$t("title")}</h1>
</div>
```

```js
new MySvelteComponent({
  target: document.body,
  props: {
    t: i18n.t$,
  },
});
```

You can also set `i18n.t$` to a Svelte [context](https://svelte.dev/docs#run-time-svelte-setcontext).

For more advance usages checkout [val-i18n-svelte](https://github.com/crimx/val-i18n-svelte).

### React

It is recommended to also install [`val-i18n-react`](https://github.com/crimx/val-i18n-react) which includes some handy hooks.

Or you can just use the hooks for `value-enhancer`: [`use-value-enhancer`](https://github.com/crimx/use-value-enhancer).
