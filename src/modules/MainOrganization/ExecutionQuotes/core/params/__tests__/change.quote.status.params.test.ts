import { describe, expect, it } from 'vitest';
import ChangeQuoteStatusParams from '../change.quote.status.params';
import { QuoteStatusEnum } from '../../constants/quote.status.enum';

describe('ChangeQuoteStatusParams', () => {
  it('validates quoteId and status', () => {
    const invalid = new ChangeQuoteStatusParams({
      quoteId: 0,
      status: QuoteStatusEnum.DRAFT,
    });
    expect(invalid.validate().isValid).toBe(false);

    const valid = new ChangeQuoteStatusParams({
      quoteId: 10,
      status: QuoteStatusEnum.SENT_TO_CLIENT,
    });
    expect(valid.validate().isValid).toBe(true);
    expect(valid.toMap()).toEqual({
      quote_id: 10,
      status: QuoteStatusEnum.SENT_TO_CLIENT,
    });
  });
});
