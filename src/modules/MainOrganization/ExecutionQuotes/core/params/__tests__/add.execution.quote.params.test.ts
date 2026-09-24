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
      attachments: [
        {
          file: 'data:application/pdf;base64,cXVvdGU=',
          alt: 'requirements.pdf',
        },
      ],
    });

    expect(params.toMap()).toEqual({
      client_id: 5,
      project_id: 10,
      quote_type_id: 2,
      price_employee_id: 7,
      quote_source: QuoteSourceEnum.EXECUTION_ONLY,
      attachments: [
        {
          file: 'data:application/pdf;base64,cXVvdGU=',
          alt: 'requirements.pdf',
        },
      ],
    });

    expect(params.toMap()).not.toHaveProperty('design_quote_id');
    expect(params.toMap()).not.toHaveProperty('stages');
  });

  it('omits legacy design quote and pricing fields for design-source execution', () => {
    const params = new AddExecutionQuoteParams({
      quoteSource: QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE,
      projectId: 15,
      clientId: 28,
      quoteTypeId: 1,
      priceEmployeeId: 7,
      attachments: [{ file: 'data:image/png;base64,aW1hZ2U=', alt: 'design.png' }],
    });

    expect(params.toMap()).toEqual({
      client_id: 28,
      project_id: 15,
      quote_type_id: 1,
      quote_source: QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE,
    });

    expect(params.toMap()).not.toHaveProperty('price_employee_id');
    expect(params.toMap()).not.toHaveProperty('design_quote_id');
    expect(params.toMap()).not.toHaveProperty('attachments');
  });

  it('reports missing required IDs', () => {
    const params = new AddExecutionQuoteParams({ quoteSource: QuoteSourceEnum.EXECUTION_ONLY });
    expect(params.validate().isValid).toBe(false);
  });

  it('requires the quote type selected before the base request', () => {
    const params = new AddExecutionQuoteParams({
      quoteSource: QuoteSourceEnum.EXECUTION_ONLY,
      clientId: 5,
      projectId: 10,
      priceEmployeeId: 7,
    });

    expect(params.validate().errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'quoteTypeId' })]),
    );
  });

  it('requires only client and project for design-source execution', () => {
    const valid = new AddExecutionQuoteParams({
      quoteSource: QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE,
      clientId: 5,
      projectId: 10,
      quoteTypeId: 2,
    });

    const invalid = new AddExecutionQuoteParams({
      quoteSource: QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE,
      clientId: 5,
      projectId: undefined,
      quoteTypeId: 2,
    });

    expect(valid.validate().isValid).toBe(true);
    expect(invalid.validate().isValid).toBe(false);
  });
});
