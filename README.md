# [val-18n](https://github.com/crimx/val-i18n)

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
npm add val-18n value-enhancer
```

## Features

- Subscribable reactive `i18n$` and `t$`.
- Lightweight and fast `t()` translation.
- Nested locale messages.
- Message formatting and pluralization.
- Easy dynamic locale loading.

## Usage

With static locales:

```ts
import { I18n, type Locales } from "val-i18n";

const locales = {
  en: {
    stock: {
      fruit: "apple",
    },
  },
};

const i18n = new I18n("en", locales);
i18n.t("stock.fruit"); // apple
```

With dynamic locales:

```ts
import { I18n, type Locales } from "val-i18n";

const i18n = await I18n.load("en", lang => import(`./locales/${lang}.json`));
```

### Message Formatting

Message keys are surrounded by double curly brackets:

```ts
import { I18n, type Locales } from "val-i18n";

const locales = {
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

const locales = {
  en: {
    fav_fruit: "I love {{0}} and {{1}}",
  },
};

const i18n = new I18n("en", locales);
i18n.t("fav_fruit", ["apple", "banana"]); // I love apple and banana
```

### Pluralization

Message formatting supports a special key `:option` whose value will be appended to the key-path.

```ts
i18n.t("a.b.c", { ":option": "d" });
```

It will look for `"a.b.c.d"` and fallback to `"a.b.c.other"` if not found.

So for pluralization we can simply use `:option` as number count.

```ts
import { I18n, type Locales } from "val-i18n";

const locales = {
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

`i18n.i18n$` and `i18n.t$` are subscribable values.

See [value-enhancer](https://github.com/crimx/value-enhancer#value-enhancer) for more details.
