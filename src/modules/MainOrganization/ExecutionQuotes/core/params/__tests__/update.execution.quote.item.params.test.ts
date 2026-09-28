import { describe, expect, it } from 'vitest';

import { ExecutionQuoteItemSourceEnum } from '../../constants/execution.quote.item.source.enum';
import UpdateExecutionQuoteItemParams from '../update.execution.quote.item.params';

describe('UpdateExecutionQuoteItemParams', () => {
  it('serializes the complete edit_quote_item contract', () => {
    const params = new UpdateExecutionQuoteItemParams({
      quoteItemId: 15,
      itemType: ExecutionQuoteItemSourceEnum.PRODUCT,
      morphId: 17,
      expectedPrice: 125.5,
      quantity: 3,
      unit: 165,
    });

    expect(params.quoteItemId).toBe(15);
    expect(params.toMap()).toEqual({
      quote_item_id: 15,
      item_type: ExecutionQuoteItemSourceEnum.PRODUCT,
      morph_id: 17,
      expected_price: 125.5,
      quantity: 3,
      unit: 165,
    });
  });

  it.each([
    {
      quoteItemId: 0,
      itemType: ExecutionQuoteItemSourceEnum.PRODUCT,
      morphId: 17,
      expectedPrice: 1,
      quantity: 1,
      unit: 165,
    },
    {
      quoteItemId: 15,
      itemType: ExecutionQuoteItemSourceEnum.PRODUCT,
      morphId: 0,
      expectedPrice: 1,
      quantity: 1,
      unit: 165,
    },
    {
      quoteItemId: 15,
      itemType: ExecutionQuoteItemSourceEnum.PRODUCT,
      morphId: 17,
      expectedPrice: -1,
      quantity: 1,
      unit: 165,
    },
    {
      quoteItemId: 15,
      itemType: ExecutionQuoteItemSourceEnum.PRODUCT,
      morphId: 17,
      expectedPrice: 1,
      quantity: 0,
      unit: 165,
    },
    {
      quoteItemId: 15,
      itemType: ExecutionQuoteItemSourceEnum.PRODUCT,
      morphId: 17,
      expectedPrice: 1,
      quantity: 1,
      unit: 0,
    },
  ])('rejects invalid item update values %#', (values) => {
    expect(new UpdateExecutionQuoteItemParams(values).validate().isValid).toBe(false);
  });
});
