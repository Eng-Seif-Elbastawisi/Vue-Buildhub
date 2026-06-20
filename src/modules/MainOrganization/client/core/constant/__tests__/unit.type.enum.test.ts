import { describe, expect, it } from 'vitest';
import { UnitTypeEnum } from '../unit.type.enum';

describe('client UnitTypeEnum', () => {
  it('exposes stable unit identifiers', () => {
    expect(UnitTypeEnum).toEqual({ meter: 1, bag: 2, box: 3 });
  });
});
