import { describe, expect, it } from 'vitest';

import { ExecutionQuoteItemSourceEnum } from '../../constants/execution.quote.item.source.enum';
import StoreExecutionQuoteDetailsParams from '../store.execution.quote.details.params';

describe('StoreExecutionQuoteDetailsParams', () => {
  it('serializes the backend morph-item contract exactly', () => {
    const params = new StoreExecutionQuoteDetailsParams({
      quoteId: 1,
      stageId: 82,
      subStageId: 85,
      itemType: ExecutionQuoteItemSourceEnum.PRODUCT,
      items: [
        { morphId: 25, expectedPrice: 500, quantity: 3 },
        { morphId: 30, expectedPrice: 750, quantity: 2 },
        { morphId: 35, expectedPrice: 250, quantity: 5 },
      ],
    });

    expect(params.toMap()).toEqual({
      quote_id: 1,
      stage_id: 82,
      sub_stage_id: 85,
      item_type: 1,
      items: [
        { morph_id: 25, expected_price: 500, quantity: 3 },
        { morph_id: 30, expected_price: 750, quantity: 2 },
        { morph_id: 35, expected_price: 250, quantity: 5 },
      ],
    });
    expect(params.validate().isValid).toBe(true);
  });

  it('rejects an empty items group', () => {
    const params = new StoreExecutionQuoteDetailsParams({
      quoteId: 1,
      stageId: 82,
      subStageId: 85,
      itemType: ExecutionQuoteItemSourceEnum.PRODUCT,
      items: [],
    });

    expect(params.validate().isValid).toBe(false);
  });
});
