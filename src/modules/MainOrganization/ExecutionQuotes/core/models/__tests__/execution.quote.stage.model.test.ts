import { describe, expect, it } from 'vitest';

import ExecutionQuoteStageModel from '../execution.quote.stage.model';

describe('ExecutionQuoteStageModel', () => {
  it('preserves nested sub-stage groups, titles and stage-level pricing from the resource', () => {
    const stages = ExecutionQuoteStageModel.fromList([
      {
        id: 104,
        quote_id: 142,
        project_id: 243,
        stage: { id: 129, title: 'مرحله السباكه' },
        sub_stages: [
          {
            id: 13,
            sub_stage: { id: 150, title: 'sub stage2' },
            items: [
              {
                id: 191,
                item_type: 1,
                itemable_id: 31,
                itemable_type: 'Product',
                itemable: { id: 31, title: 'ihgihbih' },
                measurement_unit: { id: 165, title: 'كيلومتر مربع' },
                expected_price: '500.00',
                quantity: 4,
              },
            ],
          },
          {
            id: 14,
            sub_stage: { id: 153, title: 'تاسيس كهرباء' },
            items: [],
          },
        ],
        total_price: '22000.00',
        client_price: null,
        created_at: '2026-10-01 06:45:28',
      },
    ]);

    expect(stages).toHaveLength(1);
    expect(stages[0]).toMatchObject({
      id: 104,
      quoteId: 142,
      projectId: 243,
      stage: { id: 129, title: 'مرحله السباكه' },
      subStages: [
        {
          id: 13,
          subStage: { id: 150, title: 'sub stage2' },
          items: [
            expect.objectContaining({
              id: 191,
              itemType: 1,
              itemableId: 31,
              itemableType: 'Product',
              itemable: expect.objectContaining({ id: 31, title: 'ihgihbih' }),
              measurementUnit: expect.objectContaining({ id: 165, title: 'كيلومتر مربع' }),
              expectedPrice: 500,
              quantity: 4,
            }),
          ],
        },
        { id: 14, subStage: { id: 153, title: 'تاسيس كهرباء' }, items: [] },
      ],
      totalPrice: 22000,
      clientPrice: null,
      createdAt: '2026-10-01 06:45:28',
    });
  });

  it.each([null, undefined, [], {}])(
    'returns no stages for an absent or non-array list: %j',
    (rawStages) => {
      expect(ExecutionQuoteStageModel.fromList(rawStages)).toEqual([]);
    },
  );

  it('flattens nested sub-stages while preserving their parent stage', () => {
    const stages = ExecutionQuoteStageModel.fromRows([
      {
        id: '94',
        quote_id: '132',
        project_id: '101',
        stage: { id: '129', title: 'Main stage' },
        client_price: '5000.00',
        sub_stages: [
          {
            sub_stage: { id: '150', title: 'First sub-stage' },
            total_price: '1000.00',
            items: [{ id: '176', quantity: '1' }],
          },
          {
            sub_stage: { id: '151', title: 'Second sub-stage' },
            total_price: '2000.00',
            items: [],
          },
        ],
      },
    ]);

    expect(stages).toHaveLength(2);
    expect(stages[0]).toMatchObject({
      id: 94,
      quoteId: 132,
      projectId: 101,
      stageId: 129,
      subStageId: 150,
      stage: { id: 129, title: 'Main stage' },
      subStage: { id: 150, title: 'First sub-stage' },
      clientPrice: 5000,
      totalPrice: 1000,
      items: [expect.objectContaining({ id: 176, quantity: 1 })],
    });
    expect(stages[1]).toMatchObject({
      stageId: 129,
      subStageId: 151,
      totalPrice: 2000,
      items: [],
    });
  });
});
