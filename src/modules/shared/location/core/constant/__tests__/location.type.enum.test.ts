import { describe, expect, it } from 'vitest';
import { LocationTypeEnum } from '../location.type.enum';

describe('LocationTypeEnum', () => {
  it('exposes stable location type identifiers', () => {
    expect(LocationTypeEnum).toEqual({ wareHouse: 1, store: 2, building: 3, apartment: 4 });
  });
});
