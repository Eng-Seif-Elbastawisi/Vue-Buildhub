import { describe, expect, it } from 'vitest';

import IndexProductsParams from '../index.products.params';

describe('IndexProductsParams', () => {
  it('maps selected stage ids without changing existing index filters', () => {
    const params = new IndexProductsParams({
      word: 'door',
      page: 2,
      perPage: 12,
      withPage: 1,
      stageIds: [4, 5, 8],
    });

    expect(params.toMap()).toEqual({
      word: 'door',
      with_pagination: 1,
      page: 2,
      per_page: 12,
      stage_ids: [4, 5, 8],
    });
  });

  it('omits the stage filter when no stages are selected', () => {
    const params = new IndexProductsParams({ perPage: 12 });

    expect(params.toMap()).not.toHaveProperty('stage_ids');
  });
});
