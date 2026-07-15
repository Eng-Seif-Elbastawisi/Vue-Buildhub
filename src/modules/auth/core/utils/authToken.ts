const INVALID_TOKEN_VALUES = new Set(['', 'undefined', 'null', 'bearer']);

export const getUsableAuthToken = (token: unknown): string | null => {
  if (typeof token !== 'string') return null;

  const normalizedToken = token.trim();

  if (INVALID_TOKEN_VALUES.has(normalizedToken.toLowerCase()) || /\s/.test(normalizedToken)) {
    return null;
  }

  return normalizedToken;
};

export const hasUsableAuthToken = (token: unknown): boolean => getUsableAuthToken(token) !== null;
