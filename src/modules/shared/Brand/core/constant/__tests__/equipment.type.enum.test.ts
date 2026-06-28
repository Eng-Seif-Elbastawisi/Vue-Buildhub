import { describe, expect, it } from 'vitest';
import { BrandTypeEnum } from '../Brand.type.enum';

describe('BrandTypeEnum', () => {
  it('exposes stable brand type identifiers', () => {
    expect(BrandTypeEnum).toEqual({ MATERIALS: 1, SUPPLIES: 2 });
  });
});
