/**
 * t("Hello, {{name}}!", { name: "World" }) => "Hello, World!"
 */
export type TFunction = (key: string, args?: Record<string, string>) => string;

export type LocaleLang = string;
