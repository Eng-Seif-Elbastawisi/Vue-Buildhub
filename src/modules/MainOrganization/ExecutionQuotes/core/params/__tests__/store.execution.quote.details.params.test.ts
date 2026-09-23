import { describe, expect, it } from 'vitest';

import { ExecutionQuoteItemSourceEnum } from '../../constants/execution.quote.item.source.enum';
import { ExecutionQuoteTypeEnum } from '../../constants/execution.quote.type.enum';
import StoreExecutionQuoteDetailsParams from '../store.execution.quote.details.params';

describe('StoreExecutionQuoteDetailsParams', () => {
  it('serializes the second-step details payload', () => {
    const params = new StoreExecutionQuoteDetailsParams({
      executionQuoteId: 28,
      quoteType: ExecutionQuoteTypeEnum.LUMP_SUM,
      stages: [
        {
          stage_id: 152,
          client_price: 52000,
          items: [
            {
              sub_stage_id: 153,
              source_type: ExecutionQuoteItemSourceEnum.PRODUCT,
              source_id: 16,
              sorting_id: 45,
              quantity: 1,
              unit_price: 1000,
            },
            {
              sub_stage_id: 153,
              source_type: ExecutionQuoteItemSourceEnum.LABOR,
              source_id: 6,
              quantity: 2,
              unit_price: 170,
            },
          ],
        },
      ],
    });

    expect(params.toMap()).toEqual({
      execution_quote_id: 28,
      quote_type: 'lump_sum',
      stages: [
        {
          stage_id: 152,
          client_price: 52000,
          items: [
            {
              sub_stage_id: 153,
              source_type: 'product',
              source_id: 16,
              sorting_id: 45,
              quantity: 1,
              unit_price: 1000,
            },
            {
              sub_stage_id: 153,
              source_type: 'labor',
              source_id: 6,
              quantity: 2,
              unit_price: 170,
            },
          ],
        },
      ],
    });
  });

  it('omits sorting_id when the source item has no sorting', () => {
    const params = new StoreExecutionQuoteDetailsParams({
      executionQuoteId: 28,
      quoteType: ExecutionQuoteTypeEnum.SUPERVISION,
      stages: [
        {
          stage_id: 152,
          client_price: 5000,
          items: [
            {
              sub_stage_id: 153,
              source_type: ExecutionQuoteItemSourceEnum.BUILDING_MATERIAL,
              source_id: 37,
              quantity: 3,
              unit_price: 580,
            },
          ],
        },
      ],
    });

    const payload = params.toMap() as any;
    expect(payload.stages[0].items[0]).not.toHaveProperty('sorting_id');
  });

  it('requires an execution quote id, quote type and at least one item', () => {
    const params = new StoreExecutionQuoteDetailsParams({
      executionQuoteId: 0,
      quoteType: ExecutionQuoteTypeEnum.LUMP_SUM,
      stages: [{ stage_id: 152, client_price: 1000, items: [] }],
    });

    expect(params.validate().isValid).toBe(false);
  });
});
