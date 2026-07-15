import { describe, expect, it } from 'vitest';
import { UserType } from '../userType.enum';

describe('UserType backend contract', () => {
  it('preserves the role values used by login payloads and route prefixes', () => {
    expect(UserType.ADMIN).toBe(1);
    expect(UserType.ORGANIZATION).toBe(2);
  });
});
