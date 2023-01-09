/** Optional `args` object for t function */
export type TArgs = Record<string, string>;

export type TemplateMessageFn = (args: TArgs) => string;

export type LocaleTemplateMessageFn = Map<string, TemplateMessageFn>;

/**
 * Create an interpreter function for template locale message.
 *
 * `"a {{b}} c"` => `` `a ${args.b} c` ``
 */
export const createTemplateMessageFn = (message: string): TemplateMessageFn => {
  const slices: string[] = [];
  const argPosition: Array<{ i: number; k: string }> = [];
  const matchArgs = /{{(\S+?)}}/gi;
  let slice: RegExpExecArray | null;
  let pointer = 0;
  while ((slice = matchArgs.exec(message))) {
    slices.push(message.slice(pointer, slice.index), "");
    argPosition.push({ i: slices.length - 1, k: slice[1] });
    pointer = slice.index + slice[0].length;
  }
  slices.push(message.slice(pointer));
  return (args: TArgs) => {
    for (const { i, k } of argPosition) {
      slices[i] = args[k] || k;
    }
    return slices.join("");
  };
};
