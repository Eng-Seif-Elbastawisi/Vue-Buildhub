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
});
