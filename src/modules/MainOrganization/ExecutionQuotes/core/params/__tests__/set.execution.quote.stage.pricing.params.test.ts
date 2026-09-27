import { describe, expect, it } from 'vitest';

import { ExecutionQuoteTypeEnum } from '../../constants/execution.quote.type.enum';
import SetExecutionQuoteStagePricingParams, {
  ExecutionQuoteStagePricingDraft,
} from '../set.execution.quote.stage.pricing.params';

describe('SetExecutionQuoteStagePricingParams', () => {
  it('sends client_price for a lump-sum quote stage', () => {
    const params = new SetExecutionQuoteStagePricingParams({
      quoteStageId: 45,
      quoteType: ExecutionQuoteTypeEnum.LUMP_SUM,
      pricingValue: 3500,
    });

    expect(params.toMap()).toEqual({
      quote_stage_id: 45,
      quote_type: ExecutionQuoteTypeEnum.LUMP_SUM,
      client_price: 3500,
    });
  });

  it('sends percentage for a supervision quote stage', () => {
    const params = new SetExecutionQuoteStagePricingParams({
      quoteStageId: 43,
      quoteType: ExecutionQuoteTypeEnum.SUPERVISION,
      pricingValue: 10,
    });

    expect(params.toMap()).toEqual({
      quote_stage_id: 43,
      quote_type: ExecutionQuoteTypeEnum.SUPERVISION,
      percentage: 10,
    });
  });

  it.each([101, Number.NaN])('rejects invalid supervision percentage %s', (pricingValue) => {
    const params = new SetExecutionQuoteStagePricingParams({
      quoteStageId: 43,
      quoteType: ExecutionQuoteTypeEnum.SUPERVISION,
      pricingValue,
    });

    expect(params.validate()).toMatchObject({
      isValid: false,
      errors: [expect.objectContaining({ field: 'percentage' })],
    });
  });

  it.each([
    [ExecutionQuoteTypeEnum.LUMP_SUM, 0, 'client_price'],
    [ExecutionQuoteTypeEnum.LUMP_SUM, 0.5, 'client_price'],
    [ExecutionQuoteTypeEnum.LUMP_SUM, null, 'client_price'],
    [ExecutionQuoteTypeEnum.SUPERVISION, 0, 'percentage'],
    [ExecutionQuoteTypeEnum.SUPERVISION, 0.5, 'percentage'],
    [ExecutionQuoteTypeEnum.SUPERVISION, null, 'percentage'],
  ] as const)(
    'requires pricing from 1 for quote type %s when value is %s',
    (quoteType, pricingValue, expectedField) => {
      const pricingDraft = new ExecutionQuoteStagePricingDraft({
        stageId: 129,
        subStageId: 150,
        quoteType,
        pricingValue,
      });

      expect(pricingDraft.validate()).toMatchObject({
        isValid: false,
        errors: [expect.objectContaining({ field: expectedField })],
      });
    },
  );

  it('converts a new-stage percentage draft after the backend stage id is known', () => {
    const pricingDraft = new ExecutionQuoteStagePricingDraft({
      stageId: 129,
      subStageId: 150,
      quoteType: ExecutionQuoteTypeEnum.SUPERVISION,
      pricingValue: 10,
    });

    expect(pricingDraft.validate().isValid).toBe(true);
    expect(pricingDraft.toRequest(43).toMap()).toEqual({
      quote_stage_id: 43,
      quote_type: ExecutionQuoteTypeEnum.SUPERVISION,
      percentage: 10,
    });
  });
});
