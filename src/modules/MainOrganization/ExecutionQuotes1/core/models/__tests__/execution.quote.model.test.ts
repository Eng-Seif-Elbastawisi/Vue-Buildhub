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
    });

    expect(model).toMatchObject({
      id: 4,
      quoteSource: 1,
      projectId: 10,
      clientId: 5,
      quoteTypeId: 2,
      priceEmployeeId: 7,
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
});
