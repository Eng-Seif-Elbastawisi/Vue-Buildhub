import { describe, expect, it } from 'vitest';

import IndexExecutionQuoteParams from '../index.execution.quote.params';

describe('IndexExecutionQuoteParams', () => {
  it('maps execution quote filters to the API query keys', () => {
    const params = new IndexExecutionQuoteParams({
      page: 2,
      perPage: 30,
      quoteSource: 1,
      projectId: 241,
      clientId: 46,
      quoteTypeId: 2,
    });

    expect(params.toMap()).toEqual({
      with_pagination: 1,
      page: 2,
      per_page: 30,
      quote_source: 1,
      project_id: 241,
      client_id: 46,
      quote_type: 2,
    });
  });

  it('omits filters that have not been selected', () => {
    expect(new IndexExecutionQuoteParams().toMap()).toEqual({
      with_pagination: 1,
      page: 1,
      per_page: 20,
    });
  });
});
