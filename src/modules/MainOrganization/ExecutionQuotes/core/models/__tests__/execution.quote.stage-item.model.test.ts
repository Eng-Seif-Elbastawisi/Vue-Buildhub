import { describe, expect, it } from 'vitest';

import ExecutionQuoteStageItemModel from '../execution.quote.stage-item.model';

describe('ExecutionQuoteStageItemModel', () => {
  it('normalizes numeric fields and maps titled relations', () => {
    const item = ExecutionQuoteStageItemModel.fromJson({
      id: '118',
      item_type: '2',
      itemable_id: '39',
      itemable_type: 'Material',
      itemable: { id: '39', title: 'Cement' },
      expected_price: '1000.00',
      quantity: '2',
      measurement_unit: { id: '165', title: 'Bag' },
    });

    expect(item).toMatchObject({
      id: 118,
      itemType: 2,
      itemableId: 39,
      itemableType: 'Material',
      itemable: { id: 39, title: 'Cement' },
      expectedPrice: 1000,
      quantity: 2,
      unitId: 165,
      measurementUnit: { id: 165, title: 'Bag' },
    });
  });
});
