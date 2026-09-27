import { describe, expect, it } from 'vitest';
import { UnitTypeEnum } from '../../constant/unit.type.enum';
import IndexMaterialParams from '../index.materials.params';

describe('IndexMaterialParams', () => {
  it('maps pagination and optional filters', () => {
    expect(
      new IndexMaterialParams('cement', 2, 25, 1, '2026-06-17', UnitTypeEnum.bag).toMap(),
    ).toEqual({
      word: 'cement',
      with_pagination: 1,
      page: 2,
      per_page: 25,
      date_remove: '2026-06-17',
      unit: UnitTypeEnum.bag,
    });
  });

  it('maps the active-only filter', () => {
    expect(new IndexMaterialParams({ perPage: 100, withPage: 0, status: true }).toMap()).toEqual({
      with_pagination: 0,
      page: 1,
      per_page: 100,
      status: 1,
    });
  });
});
