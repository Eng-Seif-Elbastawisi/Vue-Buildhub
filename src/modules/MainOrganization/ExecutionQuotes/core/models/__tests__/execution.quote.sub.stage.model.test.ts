import { describe, expect, it } from 'vitest';

import ExecutionQuoteSubStageModel from '../execution.quote.sub.stage.model';

describe('ExecutionQuoteSubStageModel', () => {
  it.each([
    ['0.00', 0],
    [null, null],
  ])(
    'maps nested relations, items and pricing with client_price %j',
    (clientPrice, expectedPrice) => {
      const subStage = ExecutionQuoteSubStageModel.fromJson({
        id: '13',
        sub_stage: { id: '150', title: 'sub stage2' },
        items: [{ id: '191', expected_price: '500.00', quantity: 4 }],
        client_price: clientPrice,
        percentage: '10.00',
        total_price: '2000.00',
        created_at: '2026-10-01 06:45:28',
      });

      expect(subStage).toMatchObject({
        id: 13,
        subStage: { id: 150, title: 'sub stage2' },
        items: [expect.objectContaining({ id: 191, expectedPrice: 500, quantity: 4 })],
        clientPrice: expectedPrice,
        percentage: 10,
        totalPrice: 2000,
        createdAt: '2026-10-01 06:45:28',
      });
    },
  );

  it.each([undefined, null, [], {}])('handles an absent or non-array items field: %j', (items) => {
    const subStage = ExecutionQuoteSubStageModel.fromJson({ items });

    expect(subStage.items).toEqual([]);
  });
});
