import { describe, expect, it } from 'vitest';

import { QuoteSourceEnum } from '../../constants/quote.source.enum';
import AddExecutionQuoteParams from '../add.execution.quote.params';

describe('AddExecutionQuoteParams', () => {
  it('serializes existing client base payload with attachments', () => {
    const params = new AddExecutionQuoteParams({
      quoteSource: QuoteSourceEnum.EXECUTION_ONLY,
      projectId: 10,
      clientExist: true,
      clientId: 5,
      quoteTypeId: 2,
      priceEmployeeId: 7,
      attachments: [
        {
          file: 'data:application/pdf;base64,cXVvdGU=',
          alt: 'requirements.pdf',
          link: null,
        },
      ],
    });

    expect(params.toMap()).toEqual({
      client_exist: true,
      client_id: 5,
      project_id: 10,
      quote_type_id: 2,
      price_employee_id: 7,
      quote_source: QuoteSourceEnum.EXECUTION_ONLY,
      attachments: [
        {
          file: 'data:application/pdf;base64,cXVvdGU=',
          alt: 'requirements.pdf',
          link: null,
        },
      ],
    });

    expect(params.toMap()).not.toHaveProperty('design_quote_id');
    expect(params.toMap()).not.toHaveProperty('stages');
  });

  it('serializes new client base payload with all new client fields and attachments', () => {
    const params = new AddExecutionQuoteParams({
      clientExist: false,
      clientName: 'Ahmed Elmsery',
      clientPhone: '0132295378',
      clientEmail: 'ahmed@gmail.com',
      clientAddress: 'Cairo',
      clientSourceId: 2,
      quoteSource: QuoteSourceEnum.EXECUTION_ONLY,
      projectId: 237,
      quoteTypeId: 1,
      priceEmployeeId: 12,
      attachments: [
        {
          file: 'data:image/png;base64,iCC',
          alt: 'Project Front View',
          link: null,
        },
      ],
    });

    expect(params.toMap()).toEqual({
      client_exist: false,
      client_name: 'Ahmed Elmsery',
      client_phone: '0132295378',
      client_email: 'ahmed@gmail.com',
      client_address: 'Cairo',
      client_source_id: 2,
      quote_source: QuoteSourceEnum.EXECUTION_ONLY,
      project_id: 237,
      quote_type_id: 1,
      price_employee_id: 12,
      attachments: [
        {
          file: 'data:image/png;base64,iCC',
          alt: 'Project Front View',
          link: null,
        },
      ],
    });
  });

  it('omits pricing fields for design-source execution', () => {
    const params = new AddExecutionQuoteParams({
      quoteSource: QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE,
      projectId: 15,
      clientExist: true,
      clientId: 28,
      quoteTypeId: 1,
      priceEmployeeId: 7,
      attachments: [{ file: 'data:image/png;base64,aW1hZ2U=', alt: 'design.png', link: null }],
    });

    expect(params.toMap()).toEqual({
      client_exist: true,
      client_id: 28,
      project_id: 15,
      quote_type_id: 1,
      quote_source: QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE,
      attachments: [
        {
          file: 'data:image/png;base64,aW1hZ2U=',
          alt: 'design.png',
          link: null,
        },
      ],
    });

    expect(params.toMap()).not.toHaveProperty('price_employee_id');
    expect(params.toMap()).not.toHaveProperty('design_quote_id');
  });

  it('reports missing required IDs', () => {
    const params = new AddExecutionQuoteParams({ quoteSource: QuoteSourceEnum.EXECUTION_ONLY });
    expect(params.validate().isValid).toBe(false);
  });

  it('requires at least one attachment before storing the base quote', () => {
    const params = new AddExecutionQuoteParams({
      quoteSource: QuoteSourceEnum.EXECUTION_ONLY,
      clientExist: true,
      clientId: 5,
      projectId: 10,
      quoteTypeId: 1,
      priceEmployeeId: 7,
      attachments: [],
    });

    expect(params.validate().errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'attachments' })]),
    );
  });

  it('requires the quote type selected before the base request', () => {
    const params = new AddExecutionQuoteParams({
      quoteSource: QuoteSourceEnum.EXECUTION_ONLY,
      clientExist: true,
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
      clientExist: true,
      clientId: 5,
      projectId: 10,
      quoteTypeId: 2,
      attachments: [{ file: 'data:image/png;base64,aW1hZ2U=' }],
    });

    const invalid = new AddExecutionQuoteParams({
      quoteSource: QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE,
      clientExist: true,
      clientId: 5,
      projectId: undefined,
      quoteTypeId: 2,
      attachments: [{ file: 'data:image/png;base64,aW1hZ2U=' }],
    });

    expect(valid.validate().isValid).toBe(true);
    expect(invalid.validate().isValid).toBe(false);
  });

  it('validates required fields for new client', () => {
    const invalid = new AddExecutionQuoteParams({
      quoteSource: QuoteSourceEnum.EXECUTION_ONLY,
      clientExist: false,
      clientName: '',
      clientPhone: '',
      clientSourceId: undefined,
      projectId: 10,
      quoteTypeId: 1,
      priceEmployeeId: 5,
    });

    const validation = invalid.validate();
    expect(validation.isValid).toBe(false);
    expect(validation.errors.map((e) => e.field)).toEqual(
      expect.arrayContaining(['clientName', 'clientPhone', 'clientSourceId']),
    );
  });
});
