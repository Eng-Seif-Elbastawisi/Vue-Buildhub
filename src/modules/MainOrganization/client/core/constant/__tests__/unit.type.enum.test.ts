import { describe, expect, it } from 'vitest';
import { ClientTypeEnum } from '../client.type.enum';

describe('ClientTypeEnum', () => {
  it('exposes stable client type identifiers', () => {
    expect(ClientTypeEnum).toEqual({ INDIVIDUAL: 1, COMPANY: 2, DEVELOPER: 3 });
  });
});
