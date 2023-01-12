/** Optional `args` object for t function */
export type TArgs = Record<string, string>;

export type TemplateMessageFn = (args: TArgs) => string;

export type LocaleTemplateMessageFns = Map<string, TemplateMessageFn>;

/**
 * Create an interpreter function for template locale message.
 *
 * `"a {{b}} c"` => `` `a ${args.b} c` ``
 */
export const createTemplateMessageFn = (message: string): TemplateMessageFn => {
  const slices: string[] = [];
  const keys: string[] = [];
  const matchArgs = /{{(\S+?)}}/gi;
  let slice: RegExpExecArray | null;
  let pointer = 0;
  while ((slice = matchArgs.exec(message))) {
    slices.push(message.slice(pointer, slice.index), "");
    keys.push(slice[1]);
    pointer = slice.index + slice[0].length;
  }
  slices.push(message.slice(pointer));
  return (args: TArgs): string => {
    for (let i = keys.length - 1; i >= 0; i--) {
      slices[i * 2 + 1] = args[keys[i]] || keys[i];
    }
    return slices.join("");
  };
};
