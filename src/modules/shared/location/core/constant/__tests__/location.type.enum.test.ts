import { describe, expect, it } from 'vitest';
import { LocationTypeEnum } from '../location.type.enum';

describe('LocationTypeEnum', () => {
  it('exposes stable location type identifiers', () => {
    expect(LocationTypeEnum).toEqual({
      COUNTRY: 1,
      GOVERNORATE: 2,
      CITY: 3,
      REGION: 4,
      PLACE: 5,
    });
  });
});
