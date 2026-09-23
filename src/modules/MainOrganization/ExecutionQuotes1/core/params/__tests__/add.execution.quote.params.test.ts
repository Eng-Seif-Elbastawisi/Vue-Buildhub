import { describe, expect, it } from 'vitest';

import { QuoteSourceEnum } from '../../constants/quote.source.enum';
import { ExecutionQuoteItemSourceEnum } from '../../constants/execution.quote.item.source.enum';
import { ExecutionQuoteTypeEnum } from '../../constants/execution.quote.type.enum';
import AddExecutionQuoteParams from '../add.execution.quote.params';

describe('AddExecutionQuoteParams', () => {
  it('serializes the complete execution-only payload', () => {
    const params = new AddExecutionQuoteParams({
      quoteSource: 1,
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
      quote_source: 1,
    });
  });

  it('serializes project and quote type while omitting price employee for design-quote execution', () => {
    const params = new AddExecutionQuoteParams({
      quoteSource: QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE,
      projectId: 15,
      clientId: 28,
      quoteTypeId: 3,
      priceEmployeeId: 7,
    });

    expect(params.toMap()).toEqual({
      client_id: 28,
      project_id: 15,
      quote_type_id: 3,
      quote_source: QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE,
    });

    expect(params.toMap()).not.toHaveProperty('price_employee_id');
  });

  it('reports missing required IDs', () => {
    const params = new AddExecutionQuoteParams({ quoteSource: 1 });

    expect(params.validate().isValid).toBe(false);
  });

  it('does not require a price employee ID for design-quote execution', () => {
    const params = new AddExecutionQuoteParams({
      quoteSource: 2,
      clientId: 5,
      projectId: 10,
      quoteTypeId: 15,
    });

    expect(params.validate().isValid).toBe(true);
  });

  it('normalizes stages and item sources in the final JSON contract', () => {
    const params = new AddExecutionQuoteParams({
      quoteSource: QuoteSourceEnum.EXECUTION_ONLY,
      projectId: 10,
      clientId: 5,
      quoteTypeId: 2,
      priceEmployeeId: 7,
      executionQuoteType: ExecutionQuoteTypeEnum.LUMP_SUM,
      stages: [
        {
          stage_id: 5,
          client_price: 52000,
          items: [
            {
              sub_stage_id: 12,
              source_type: ExecutionQuoteItemSourceEnum.LABOR,
              source_id: 8,
              quantity: 2,
              unit_price: 170,
            },
          ],
        },
      ],
    });

    expect(params.toMap()).toMatchObject({
      quote_type: 'lump_sum',
      stages: [
        {
          stage_id: 5,
          client_price: 52000,
          items: [
            {
              sub_stage_id: 12,
              source_type: 'labor',
              source_id: 8,
              quantity: 2,
              unit_price: 170,
            },
          ],
        },
      ],
    });
    expect(params.validateFinal().isValid).toBe(true);
  });

  it('requires at least one normalized quote item before final save', () => {
    const params = new AddExecutionQuoteParams({
      quoteSource: QuoteSourceEnum.EXECUTION_ONLY,
      projectId: 10,
      clientId: 5,
      quoteTypeId: 2,
      priceEmployeeId: 7,
      executionQuoteType: ExecutionQuoteTypeEnum.SUPERVISION,
      stages: [{ stage_id: 5, client_price: 52000, items: [] }],
    });

    expect(params.validateFinal().isValid).toBe(false);
  });
});
