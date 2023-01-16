import { describe, it, expect } from "@jest/globals";
import { createTemplateMessageFn } from "../src/template-message";

describe("template message", () => {
  it("should parse template message", () => {
    const fn = createTemplateMessageFn("{{name}} eats {{fruit}}");
    expect(fn({ name: "CRIMX", fruit: "apple" })).toBe("CRIMX eats apple");
    expect(fn({ name: "CRIMX", fruit: "banana" })).toBe("CRIMX eats banana");
  });

  it("should fallback to key if args not provided", () => {
    const fn = createTemplateMessageFn(
      "Yesterday {{name}} found {{fruit}} and ate it"
    );
    expect(fn({ fruit: "an apple" })).toBe(
      "Yesterday name found an apple and ate it"
    );
  });
});
