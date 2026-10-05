import { describe, expect, it } from 'vitest';

import ExecutionQuoteStageModel from '../execution.quote.stage.model';

describe('ExecutionQuoteStageModel', () => {
  it('flattens nested sub-stages while preserving their parent stage', () => {
    const stages = ExecutionQuoteStageModel.fromList([
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
