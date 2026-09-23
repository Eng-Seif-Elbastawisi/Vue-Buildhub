import { describe, expect, it } from 'vitest';
import {
  ExecutionQuoteTypeEnum,
  getExecutionQuoteTypeDescriptionKey,
  getExecutionQuoteTypeOptions,
  getExecutionQuoteTypeTitleKey,
} from '../execution.quote.type.enum';

describe('ExecutionQuoteTypeEnum', () => {
  it('uses the backend quote type values and title keys', () => {
    expect(ExecutionQuoteTypeEnum).toEqual({ LUMP_SUM: 1, SUPERVISION: 2 });
    expect(getExecutionQuoteTypeTitleKey(ExecutionQuoteTypeEnum.LUMP_SUM)).toBe(
      'execution_quote.quote_types.lump_sum.title',
    );
    expect(getExecutionQuoteTypeDescriptionKey(ExecutionQuoteTypeEnum.LUMP_SUM)).toBe(
      'execution_quote.quote_types.lump_sum.description',
    );
    expect(getExecutionQuoteTypeDescriptionKey(ExecutionQuoteTypeEnum.SUPERVISION)).toBe(
      'execution_quote.quote_types.supervision.description',
    );
    expect(getExecutionQuoteTypeOptions()).toHaveLength(2);
  });
});
