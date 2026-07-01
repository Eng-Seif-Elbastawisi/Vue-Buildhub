import { describe, expect, it } from 'vitest';
import { UnitTypeEnum } from '../../constant/unit.type.enum';
import IndexSupplyParams from '../index.supply.params';

describe('IndexSupplyParams', () => {
  it('maps pagination and optional filters', () => {
    expect(
      new IndexSupplyParams('cement', 2, 25, 1, '2026-06-17', UnitTypeEnum.bag).toMap(),
    ).toEqual({
      word: 'cement',
      with_pagination: 1,
      page: 2,
      per_page: 25,
      date_remove: '2026-06-17',
      unit: UnitTypeEnum.bag,
    });
  });
});
