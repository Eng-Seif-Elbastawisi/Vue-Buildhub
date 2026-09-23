import { describe, expect, it } from 'vitest';
import ExecutionQuoteModel from '../execution.quote.model';

describe('ExecutionQuoteModel', () => {
  it('maps snake case API fields', () => {
    const model = ExecutionQuoteModel.fromJson({
      id: 4,
      quote_source: 1,
      project_id: 10,
      client_id: 5,
      quote_type_id: 2,
      price_employee_id: 7,
      design_quote_id: 44,
    });

    expect(model).toMatchObject({
      id: 4,
      quoteSource: 1,
      projectId: 10,
      clientId: 5,
      quoteTypeId: 2,
      priceEmployeeId: 7,
      designQuoteId: 44,
    });
  });

  it('keeps the execution quote type enum when quote_type is not a relation', () => {
    const model = ExecutionQuoteModel.fromJson({
      quote_source: 1,
      quote_type: 'lump_sum',
      quote_type_id: 2,
    });

    expect(model.quoteType).toBe('lump_sum');
    expect(model.quoteTypeId).toBe(2);
  });

  it('maps sorting_id inside execution quote items', () => {
    const model = ExecutionQuoteModel.fromJson({
      id: 4,
      stages: [
        {
          stage_id: 152,
          client_price: 5000,
          items: [
            {
              sub_stage_id: 153,
              source_type: 'product',
              source_id: 16,
              sorting_id: 45,
              quantity: 1,
              unit_price: 1000,
            },
          ],
        },
      ],
    });

    expect(model.stages[0]?.items[0]?.sorting_id).toBe(45);
  });

});
