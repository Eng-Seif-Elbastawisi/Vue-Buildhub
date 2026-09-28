import { describe, expect, it } from 'vitest';

import { ExecutionQuoteTypeEnum } from '../../constants/execution.quote.type.enum';
import SetExecutionQuoteSupervisionPricingParams from '../set.execution.quote.supervision.pricing.params';

describe('SetExecutionQuoteSupervisionPricingParams', () => {
  it('sends one quote-wide supervision percentage using the supervision enum', () => {
    const params = new SetExecutionQuoteSupervisionPricingParams({
      quoteId: 121,
      percentage: 10,
    });

    expect(params.toMap()).toEqual({
      quote_id: 121,
      quote_type: ExecutionQuoteTypeEnum.SUPERVISION,
      percentage: 10,
    });
    expect(params.validate().isValid).toBe(true);
  });

  it.each([0, 0.5, 101, Number.NaN])('rejects invalid quote-wide percentage %s', (percentage) => {
    const params = new SetExecutionQuoteSupervisionPricingParams({ quoteId: 121, percentage });

    expect(params.validate()).toMatchObject({
      isValid: false,
      errors: [expect.objectContaining({ field: 'percentage' })],
    });
  });
});
