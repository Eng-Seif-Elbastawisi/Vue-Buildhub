import { describe, expect, it } from 'vitest';
import IndexItemParams from '../index.Item.params';

describe('IndexItemParams', () => {
  it('maps default pagination', () => {
    expect(new IndexItemParams().toMap()).toEqual({ with_pagination: 1, page: 1, per_page: 10 });
  });

  it('maps search, custom pagination, and date remove', () => {
    expect(new IndexItemParams('concrete', 2, 25, 1, '2026-06-18').toMap()).toEqual({
      word: 'concrete',
      with_pagination: 1,
      page: 2,
      per_page: 25,
      date_remove: '2026-06-18',
    });
  });
});
