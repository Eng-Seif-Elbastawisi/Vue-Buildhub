import { describe, expect, it } from 'vitest';
import { getQuoteSourceTitleKey, QuoteSourceEnum } from '../quote.source.enum';

describe('QuoteSourceEnum', () => {
  it('keeps the backend integer values', () => {
    expect(QuoteSourceEnum.EXECUTION_ONLY).toBe(1);
    expect(QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE).toBe(2);
  });

  it.each([
    [QuoteSourceEnum.EXECUTION_ONLY, 'execution_quote.sources.execution_only.title'],
    [QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE, 'execution_quote.sources.design_quote.title'],
  ])('maps source %s to its title translation', (source, titleKey) => {
    expect(getQuoteSourceTitleKey(source)).toBe(titleKey);
  });
});
