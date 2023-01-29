import { describe, it, expect } from "@jest/globals";
import { detectLang } from "../src/main";

describe("detectLang", () => {
  it("should detect language", () => {
    const lang = detectLang();
    expect(lang).toBeTruthy();
    expect(typeof lang).toBe("string");
  });

  it("should match given tags case insensitively", () => {
    const localeUpper = Intl.DateTimeFormat()
      .resolvedOptions()
      .locale.toUpperCase();
    expect(detectLang(["example", localeUpper, "fr"])).toBe(localeUpper);

    const localeLower = localeUpper.toLowerCase();
    expect(detectLang(["example", localeLower, "fr"])).toBe(localeLower);
  });

  it("should return null if no match", () => {
    const lang2 = detectLang(["example", "example2"]);
    expect(lang2).toBe(null);
  });

  it("should match given sub-tags case insensitively", () => {
    const localeUpper = Intl.DateTimeFormat()
      .resolvedOptions()
      .locale.split("-")[0]
      .toUpperCase();
    expect(detectLang(["example", localeUpper, "fr"])).toBe(localeUpper);

    const localeLower = localeUpper.toLowerCase();
    expect(detectLang(["example", localeLower, "fr"])).toBe(localeLower);
  });
});
