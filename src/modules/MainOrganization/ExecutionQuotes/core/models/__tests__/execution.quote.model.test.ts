import { describe, expect, it } from 'vitest';

import ExecutionQuoteModel from '../execution.quote.model';

describe('ExecutionQuoteModel', () => {
  it('maps snake case API fields', () => {
    const model = ExecutionQuoteModel.fromJson({
      id: 4,
      quote_source: 1,
      project_id: 10,
      client_id: 5,
      quote_type: 2,
      quote_type_id: 2,
      price_employee_id: 7,
    });

    expect(model).toMatchObject({
      id: 4,
      quoteSource: 1,
      projectId: 10,
      clientId: 5,
      quoteType: 2,
      quoteTypeId: 2,
      priceEmployeeId: 7,
    });
  });

  it('keeps the execution quote type enum from quote_type', () => {
    const model = ExecutionQuoteModel.fromJson({
      quote_source: 1,
      quote_type: 1,
    });

    expect(model.quoteType).toBe(1);
  });

  it('rejects legacy quote type names outside the numeric enum', () => {
    const model = ExecutionQuoteModel.fromJson({ quote_type: 'supervision' });

    expect(model.quoteType).toBeUndefined();
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
              stage_id: 153,
              source_type: 1,
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
    expect(model.stages[0]?.items[0]?.stage_id).toBe(153);
  });
});
