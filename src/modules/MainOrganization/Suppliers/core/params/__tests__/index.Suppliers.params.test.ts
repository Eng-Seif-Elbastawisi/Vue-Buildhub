import { describe, expect, it } from 'vitest';
import IndexSuppliersParams from '../index.Suppliers.params';

describe('IndexSuppliersParams', () => {
  it('maps pagination and optional filters', () => {
    expect(new IndexSuppliersParams('build', 2, 25, 1, '2026-06-17', 6).toMap()).toEqual({
      word: 'build',
      with_pagination: 1,
      page: 2,
      per_page: 25,
      date_remove: '2026-06-17',
      supplier_type_id: 6,
    });
  });
});
