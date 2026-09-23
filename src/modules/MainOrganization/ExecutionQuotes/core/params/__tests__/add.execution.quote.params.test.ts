import { describe, expect, it } from 'vitest';

import { QuoteSourceEnum } from '../../constants/quote.source.enum';
import AddExecutionQuoteParams from '../add.execution.quote.params';

describe('AddExecutionQuoteParams', () => {
  it('serializes only the execution-only base payload', () => {
    const params = new AddExecutionQuoteParams({
      quoteSource: QuoteSourceEnum.EXECUTION_ONLY,
      projectId: 10,
      clientId: 5,
      quoteTypeId: 2,
      priceEmployeeId: 7,
    });

    expect(params.toMap()).toEqual({
      client_id: 5,
      project_id: 10,
      quote_type_id: 2,
      price_employee_id: 7,
      quote_source: QuoteSourceEnum.EXECUTION_ONLY,
    });

    expect(params.toMap()).not.toHaveProperty('quote_type');
    expect(params.toMap()).not.toHaveProperty('stages');
  });

  it('serializes design_quote_id and omits price employee for design-quote execution', () => {
    const params = new AddExecutionQuoteParams({
      quoteSource: QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE,
      projectId: 15,
      clientId: 28,
      quoteTypeId: 3,
      priceEmployeeId: 7,
      designQuoteId: 44,
    });

    expect(params.toMap()).toEqual({
      client_id: 28,
      project_id: 15,
      quote_type_id: 3,
      quote_source: QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE,
      design_quote_id: 44,
    });

    expect(params.toMap()).not.toHaveProperty('price_employee_id');
  });

  it('reports missing required IDs', () => {
    const params = new AddExecutionQuoteParams({ quoteSource: QuoteSourceEnum.EXECUTION_ONLY });
    expect(params.validate().isValid).toBe(false);
  });

  it('requires designQuoteId instead of priceEmployeeId for design-quote execution', () => {
    const valid = new AddExecutionQuoteParams({
      quoteSource: QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE,
      clientId: 5,
      projectId: 10,
      quoteTypeId: 15,
      designQuoteId: 22,
    });

    const invalid = new AddExecutionQuoteParams({
      quoteSource: QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE,
      clientId: 5,
      projectId: 10,
      quoteTypeId: 15,
    });

    expect(valid.validate().isValid).toBe(true);
    expect(invalid.validate().isValid).toBe(false);
  });
});
