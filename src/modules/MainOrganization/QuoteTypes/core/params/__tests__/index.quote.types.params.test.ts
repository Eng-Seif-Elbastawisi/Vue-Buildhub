import { describe, expect, it } from 'vitest';
import IndexQuoteTypeParams from '../index.quote.types.params';

describe('IndexQuoteTypeParams', () => {
  it('maps server-side sorting filters', () => {
    const params = new IndexQuoteTypeParams({
      sortBy: 'title',
      sortDirection: 'asc',
    });

    expect(params.toMap()).toMatchObject({
      sort_by: 'title',
      sort_direction: 'asc',
    });
  });
});
