import { describe, it, expect, jest } from "@jest/globals";
import type { LocaleFetcher, Locales } from "../src/main";
import { I18n } from "../src/main";

describe("i18n", () => {
  it("smoke test", () => {
    const locales: Locales = { en: { name: "CRIMX" } };
    const i18n = new I18n("en", locales);
    expect(i18n.lang).toBe("en");
    expect(i18n.t("name")).toBe("CRIMX");
  });

  it("should support nested locale message", () => {
    const locales: Locales = {
      en: { daily: { fruit: { stock: "apple" } } },
    };
    const i18n = new I18n("en", locales);
    expect(i18n.t("daily.fruit.stock")).toBe("apple");
  });

  it("should update t function when lang changes", async () => {
    const locales: Locales = {
      en: { apple: "apple" },
      zh: { apple: "苹果" },
    };
    const i18n = new I18n("en", locales);

    const enT = i18n.t;
    expect(i18n.t("apple")).toBe("apple");

    await i18n.switchLang("zh");
    expect(i18n.t).not.toBe(enT);
    expect(i18n.t("apple")).toBe("苹果");
  });

  it("should add locale", () => {
    const locales: Locales = {
      en: { apple: "apple" },
    };
    const i18n = new I18n("en", locales);
    expect(i18n.t("apple")).toBe("apple");

    i18n.addLocale("zh", { apple: "苹果" });
    i18n.switchLang("zh");
    expect(i18n.t("apple")).toBe("苹果");
  });

  it("should warn if locale not found", () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => void 0);
    expect(warn).toBeCalledTimes(0);

    const i18n = new I18n("en", {});
    expect(i18n.t("name")).toBe("name");

    expect(warn).toBeCalledTimes(1);

    warn.mockReset();
  });

  it("should check if message key-path exists", () => {
    const locales: Locales = {
      en: { apple: "apple", person: { name: "CRIMX" } },
    };
    const i18n = new I18n("en", locales);

    expect(i18n.hasKey("apple")).toBe(true);
    expect(i18n.hasKey("name")).toBe(false);
    expect(i18n.hasKey("person.name")).toBe(true);
  });
});

describe("locale loader", () => {
  it("should loaded locales asynchronously", async () => {
    const fakeLocaleFetcher: LocaleFetcher = async lang => {
      const locales: Locales = {
        en: { apple: "apple" },
        zh: { apple: "苹果" },
      };
      return locales[lang];
    };

    const i18n = await I18n.load("en", fakeLocaleFetcher);

    expect(i18n.t("apple")).toBe("apple");

    await i18n.switchLang("zh");
    expect(i18n.t("apple")).toBe("苹果");
  });
});

describe("template t function", () => {
  it("should parse message template", () => {
    const locales: Locales = {
      en: { intro: "{{name}} eats {{fruit}}" },
    };
    const i18n = new I18n("en", locales);
    expect(i18n.t("intro", { name: "CRIMX", fruit: "apple" })).toBe(
      "CRIMX eats apple"
    );
  });

  it("should support array as args", () => {
    const locales: Locales = {
      en: { intro: "{{0}} eats {{1}}" },
    };
    const i18n = new I18n("en", locales);
    expect(i18n.t("intro", ["CRIMX", "apple"])).toBe("CRIMX eats apple");
  });

  it("should pick option message", () => {
    const locales: Locales = {
      en: {
        apple: {
          few: "Few apples",
          many: "Many apples",
        },
      },
    };

    const option = (n: number) => (n <= 5 ? "few" : "many");

    const i18n = new I18n("en", locales);
    expect(i18n.t("apple", { ":option": option(1) })).toBe("Few apples");
    expect(i18n.t("apple", { ":option": option(6) })).toBe("Many apples");
  });

  it("should pick plural message", () => {
    const locales: Locales = {
      en: {
        apple: {
          0: "No apple",
          1: "An apple",
          other: "{{:option}} apples",
        },
      },
    };
    const i18n = new I18n("en", locales);
    expect(i18n.t("apple", { ":option": 0 })).toBe("No apple");
    expect(i18n.t("apple", { ":option": 1 })).toBe("An apple");
    expect(i18n.t("apple", { ":option": 3 })).toBe("3 apples");
  });

  it("should return key if message not exists", () => {
    const i18n = new I18n("en", {});
    expect(i18n.t("fruit")).toBe("fruit");
    expect(i18n.t("fruit", { fruit: "apple" })).toBe("fruit");
  });
});
