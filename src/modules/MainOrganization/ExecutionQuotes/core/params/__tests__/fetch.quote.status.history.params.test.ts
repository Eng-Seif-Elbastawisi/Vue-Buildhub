import { describe, expect, it } from 'vitest';

import FetchQuoteStatusHistoryParams from '../fetch.quote.status.history.params';

describe('FetchQuoteStatusHistoryParams', () => {
  it('serializes the quote id required by the history endpoint', () => {
    const params = new FetchQuoteStatusHistoryParams({ quoteId: 143 });

    expect(params.toMap()).toEqual({ quote_id: 143 });
    expect(params.validate().isValid).toBe(true);
  });
});
