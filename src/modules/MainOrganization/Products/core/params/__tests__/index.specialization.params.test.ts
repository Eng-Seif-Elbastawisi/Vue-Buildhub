import { describe, expect, it } from 'vitest';
import IndexSpecializationParams from '../index.specialization.params';

describe('IndexSpecializationParams', () => {
  it('maps pagination and filters', () => {
    expect(new IndexSpecializationParams('mall', 2, 20, 1, '2026-06-15').toMap()).toEqual({
      word: 'mall',
      page: 2,
      per_page: 20,
      with_pagination: 1,
      date_remove: '2026-06-15',
    });
  });
});
