import { describe, expect, it } from 'vitest';
import { getUsableAuthToken, hasUsableAuthToken } from '../authToken';

describe('auth token validation', () => {
  it.each([undefined, null, '', '   ', 'undefined', 'null', 'Bearer', 'token with spaces'])(
    'rejects an unusable token value: %s',
    (token) => {
      expect(getUsableAuthToken(token)).toBeNull();
      expect(hasUsableAuthToken(token)).toBe(false);
    },
  );

  it('normalizes a usable token before it is sent', () => {
    expect(getUsableAuthToken('  opaque-token  ')).toBe('opaque-token');
    expect(hasUsableAuthToken('opaque-token')).toBe(true);
  });
});
