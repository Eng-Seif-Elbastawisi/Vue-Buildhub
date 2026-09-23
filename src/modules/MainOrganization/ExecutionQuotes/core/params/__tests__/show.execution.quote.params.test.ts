import { describe, expect, it } from 'vitest';

import ShowExecutionQuoteParams from '../show.execution.quote.params';

describe('ShowExecutionQuoteParams', () => {
  it('maps the quote id expected by the show endpoint', () => {
    const params = new ShowExecutionQuoteParams({ executionQuoteId: 28 });

    expect(params.toMap()).toEqual({ quote_id: 28 });
    expect(params.validate().isValid).toBe(true);
  });
});
