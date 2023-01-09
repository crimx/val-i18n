import { describe, it, expect } from "@jest/globals";
import { I18n } from "../src/main";

describe("i18n", () => {
  it("smoke test", () => {
    const i18n = new I18n("en", { en: { name: "CRIMX" } });
    expect(i18n.t("name")).toBe("CRIMX");
  });

  it("should update t function when lang changes", () => {
    const i18n = new I18n("en", {
      en: { apple: "apple" },
      zh: { apple: "苹果" },
    });

    const enT = i18n.t;
    expect(i18n.t("apple")).toBe("apple");

    i18n.setLang("zh");
    expect(i18n.t).not.toBe(enT);
    expect(i18n.t("apple")).toBe("苹果");
  });

  it("should parse message template", () => {
    const i18n = new I18n("en", {
      en: { intro: "{{name}} eats {{fruit}}" },
    });
    expect(i18n.t("intro", { name: "CRIMX", fruit: "apple" })).toBe(
      "CRIMX eats apple"
    );
  });
});
