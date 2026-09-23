import { describe, expect, it } from 'vitest';
import { QuoteSourceEnum } from '../quote.source.enum';

describe('QuoteSourceEnum', () => {
  it('keeps the backend integer values', () => {
    expect(QuoteSourceEnum.EXECUTION_ONLY).toBe(1);
    expect(QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE).toBe(2);
  });
});
