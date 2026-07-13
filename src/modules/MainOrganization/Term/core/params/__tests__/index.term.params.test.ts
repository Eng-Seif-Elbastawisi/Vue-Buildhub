import { describe, expect, it } from 'vitest';
import IndexTermParams from '../index.term.params';

describe('IndexTermParams', () => {
  it('maps pagination and filters', () => {
    expect(new IndexTermParams('mall', 2, 20, 1, '2026-06-15').toMap()).toEqual({
      word: 'mall',
      page: 2,
      per_page: 20,
      with_pagination: 1,
      date_remove: '2026-06-15',
    });
  });
});
