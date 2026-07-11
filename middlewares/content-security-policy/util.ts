export const dashify = (str: string): string =>
  str.replace(/[A-Z]/g, (capitalLetter) => "-" + capitalLetter.toLowerCase());

export const errify = (err: unknown): Error =>
  err instanceof Error ? err : new Error(String(err));

export const throwErrorIfExists = (err: null | Error) => {
  if (err) throw err;
};
