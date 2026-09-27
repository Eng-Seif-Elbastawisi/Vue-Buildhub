import { describe, expect, it } from 'vitest';

import { ExecutionQuoteItemSourceEnum } from '../../../core/constants/execution.quote.item.source.enum';
import type { ExecutionQuoteItemState } from '../execution.quote.ui.types';

describe('execution quote UI types', () => {
  it('keeps UI sub-stage context separate from the API item stage_id mapping', () => {
    const item: ExecutionQuoteItemState = {
      id: '1-7-1-10',
      stage_id: 1,
      sub_stage_id: 7,
      source_type: ExecutionQuoteItemSourceEnum.PRODUCT,
      source_id: 10,
      quantity: 2,
      unit_price: 25,
      unit_id: 9,
    };

    expect(item.sub_stage_id).toBe(7);
    expect(item.stage_id).toBe(1);
  });
});
