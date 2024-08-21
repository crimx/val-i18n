import { describe, it, expect } from "vitest";
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

  it("should support number as value", () => {
    const fn = createTemplateMessageFn(
      "Zero: {{zero}} One: {{one}} Two: {{two}}"
    );
    expect(fn({ zero: 0, one: 1, two: 2 })).toBe("Zero: 0 One: 1 Two: 2");
  });
});
