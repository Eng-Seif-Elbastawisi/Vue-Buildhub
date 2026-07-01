import { describe, expect, it } from 'vitest';
import IndexTermParams from '../index.term.params';

describe('IndexTermParams', () => {
  it('serializes pagination and search values', () => {
    expect(new IndexTermParams('first', 2, 20).toMap()).toMatchObject({
      word: 'first',
      page: 2,
      per_page: 20,
    });
  });
});
