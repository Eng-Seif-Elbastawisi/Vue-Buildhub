import { describe, expect, it } from 'vitest';
import { LocationTypeEnum } from '../../constant/location.type.enum';
import IndexLocationParams from '../index.location.params';

describe('IndexLocationParams', () => {
  it('maps list filters and omits empty optional filters', () => {
    expect(new IndexLocationParams('building', 2, 20, 1, '2026-06-15', LocationTypeEnum.building).toMap()).toEqual({
      word: 'building',
      with_pagination: 1,
      page: 2,
      per_page: 20,
      date_remove: '2026-06-15',
      type: LocationTypeEnum.building,
    });
    expect(new IndexLocationParams().toMap()).toEqual({
      with_pagination: 1,
      page: 1,
      per_page: 10,
    });
  });
});
