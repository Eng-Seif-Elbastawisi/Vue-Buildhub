import { describe, expect, it } from 'vitest';
import IndexClientParams from '../index.client.params';

describe('IndexClientParams', () => {
  it('maps list pagination filters', () => {
    expect(new IndexClientParams('ali', 2, 20, 1).toMap()).toEqual({
      word: 'ali',
      with_pagination: 1,
      page: 2,
      per_page: 20,
    });
  });
});
