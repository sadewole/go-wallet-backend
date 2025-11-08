export function excludeProps<T, Key extends keyof T>(
  field: T,
  keys: Key[],
): Omit<T, Key> {
  for (const key of keys) {
    delete field[key];
  }
  return field;
}

export const REDIS_KEYS = {
  FORGOT_PASSWORD_TOKEN: 'FORGOT_PASSWORD_TOKEN',
  VERIFY_EMAIL_TOKEN: 'VERIFY_EMAIL_TOKEN',
};

/**
 * @param minutes
 * @returns { code: string; expiryMin: number}
 */
export const generateExpiryCode = (minutes = 30) => ({
  code: Math.floor(1000 + Math.random() * 9000).toString(),
  expiryMin: minutes * 60 * 1000,
});
