import { describe, it, expect } from "@jest/globals";
import type { Locales } from "../src/main";
import { I18n } from "../src/main";

describe("i18n", () => {
  it("smoke test", () => {
    const locales: Locales = { en: { name: "CRIMX" } };
    const i18n = new I18n("en", locales);
    expect(i18n.t("name")).toBe("CRIMX");
  });

  it("should update t function when lang changes", () => {
    const locales: Locales = {
      en: { apple: "apple" },
      zh: { apple: "苹果" },
    };
    const i18n = new I18n("en", locales);

    const enT = i18n.t;
    expect(i18n.t("apple")).toBe("apple");

    i18n.setLang("zh");
    expect(i18n.t).not.toBe(enT);
    expect(i18n.t("apple")).toBe("苹果");
  });

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
});
