import { describe, expect, it } from 'vitest';
import {
  ExecutionQuoteTypeEnum,
  getExecutionQuoteTypeOptions,
  getExecutionQuoteTypeTitleKey,
} from '../execution.quote.type.enum';

describe('ExecutionQuoteTypeEnum', () => {
  it('uses the backend quote type values and title keys', () => {
    expect(ExecutionQuoteTypeEnum).toEqual({ LUMP_SUM: 'lump_sum', SUPERVISION: 'supervision' });
    expect(getExecutionQuoteTypeTitleKey(ExecutionQuoteTypeEnum.LUMP_SUM)).toBe(
      'execution_quote.quote_types.lump_sum.title',
    );
    expect(getExecutionQuoteTypeOptions()).toHaveLength(2);
  });
});
