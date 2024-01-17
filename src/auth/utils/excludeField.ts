type AnyObject = Record<string, any>;

export function excludeField<T extends AnyObject, K extends keyof T>(
  obj: T,
  propToDelete: K,
): Omit<T, K> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { [propToDelete]: _, ...otherProps } = obj;
  return otherProps;
}
