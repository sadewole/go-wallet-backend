export function excludeProps<T, Key extends keyof T>(
  field: T,
  keys: Key[],
): Omit<T, Key> {
  for (const key of keys) {
    delete field[key];
  }
  return field;
}
