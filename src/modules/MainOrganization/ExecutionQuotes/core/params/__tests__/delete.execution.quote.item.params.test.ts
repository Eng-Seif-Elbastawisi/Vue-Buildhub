import { describe, expect, it } from 'vitest';

import DeleteExecutionQuoteItemParams from '../delete.execution.quote.item.params';

describe('DeleteExecutionQuoteItemParams', () => {
  it('serializes the item id for delete_quote_item', () => {
    const params = new DeleteExecutionQuoteItemParams({ quoteItemId: 15 });

    expect(params.quoteItemId).toBe(15);
    expect(params.toMap()).toEqual({ quote_item_id: 15 });
    expect(params.validate().isValid).toBe(true);
  });

  it('rejects a missing item identifier', () => {
    const params = new DeleteExecutionQuoteItemParams({ quoteItemId: 0 });

    expect(params.validate().isValid).toBe(false);
  });
});
