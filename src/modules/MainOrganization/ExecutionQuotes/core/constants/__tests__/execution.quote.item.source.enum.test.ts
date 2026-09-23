import { describe, expect, it } from 'vitest';
import {
  ExecutionQuoteItemSourceEnum,
  getExecutionQuoteItemSourceOptions,
  getExecutionQuoteItemSourceTitleKey,
} from '../execution.quote.item.source.enum';

describe('ExecutionQuoteItemSourceEnum', () => {
  it('uses one normalized source value for each reusable item feature', () => {
    expect(ExecutionQuoteItemSourceEnum).toEqual({
      PRODUCT: 1,
      BUILDING_MATERIAL: 2,
      LABOR: 3,
    });
    expect(getExecutionQuoteItemSourceTitleKey(ExecutionQuoteItemSourceEnum.LABOR)).toBe(
      'execution_quote.item_sources.labor.title',
    );
    expect(getExecutionQuoteItemSourceOptions()).toHaveLength(3);
  });
});
