import { describe, expect, it } from 'vitest';

import ExecutionQuoteShowModel from '../execution.quote.show.model';

describe('ExecutionQuoteShowModel', () => {
  it('maps the execution quote show resource', () => {
    const quote = ExecutionQuoteShowModel.fromJson({
      id: 41,
      organization: { id: 1, name: 'Techlab', address: 'Techlab Headquarters' },
      employee: { id: 1, name: 'Techlab Employee' },
      quote_source: 1,
      project: {
        id: 207,
        client: { id: 30, title: 'شارع' },
        title: '007',
        description: null,
        date: '2026-08-09',
        created_at: '2026-08-09 06:13:43',
      },
      client: {
        id: 30,
        organization: { id: 1, name: 'Techlab', address: 'Techlab Headquarters' },
        employee: { id: 4, name: 'rawan mamdooh' },
        name: 'شارع',
        phone: '111',
        email: '1012@test.com',
        address: 'mansoura',
        type: 1,
        client_source: { id: 11, title: 'Website' },
        status: 1,
        created_at: '2026-07-22 13:29:29',
      },
      quote_type: { id: 1, title: 'Lump_SUM' },
      price_employee: { id: 68, name: 'type test' },
      attachments: [
        {
          id: 9,
          file: 'https://cdn.example.com/site-plan.png',
          file_size: '2 MB',
          alt: 'Site plan',
          link: null,
          created_at: '2026-09-23 12:42:35',
        },
      ],
      quote_stages: [
        {
          id: 5,
          quote_id: 41,
          project_id: 207,
          stage: { id: 129, title: 'Main stage' },
          sub_stage: { id: 150, title: 'Sub stage' },
          items: [
            {
              id: 7,
              item_type: 1,
              itemable_id: 17,
              itemable_type: 'Product',
              itemable: { id: 17, title: 'تيست1' },
              expected_price: '44444444.00',
              quantity: 1,
              unit: 9,
            },
          ],
          client_price: '52000000.00',
          total_price: '44444444.00',
          created_at: '2026-09-23 12:42:40',
        },
      ],
      created_at: '2026-09-23 11:56:21',
    });

    expect(quote).toMatchObject({
      id: 41,
      organization: { id: 1, name: 'Techlab', address: 'Techlab Headquarters' },
      employee: { id: 1, name: 'Techlab Employee' },
      quoteSource: 1,
      project: {
        id: 207,
        client: { id: 30, title: 'شارع' },
        title: '007',
        description: null,
        date: '2026-08-09',
        createdAt: '2026-08-09 06:13:43',
      },
      client: {
        id: 30,
        organization: { id: 1, name: 'Techlab', address: 'Techlab Headquarters' },
        employee: { id: 4, name: 'rawan mamdooh' },
        name: 'شارع',
        phone: '111',
        email: '1012@test.com',
        address: 'mansoura',
        clientSource: { id: 11, title: 'Website' },
        status: 1,
        createdAt: '2026-07-22 13:29:29',
      },
      quoteType: { id: 1, title: 'Lump_SUM' },
      priceEmployee: { id: 68, name: 'type test' },
      attachments: [
        {
          id: 9,
          file: 'https://cdn.example.com/site-plan.png',
          fileSize: '2 MB',
          alt: 'Site plan',
          link: null,
          createdAt: '2026-09-23 12:42:35',
        },
      ],
      quoteStages: [
        {
          id: 5,
          quoteId: 41,
          projectId: 207,
          stageId: 129,
          subStageId: 150,
          stage: { id: 129, title: 'Main stage' },
          subStage: { id: 150, title: 'Sub stage' },
          items: [
            {
              id: 7,
              itemType: 1,
              itemableId: 17,
              itemableType: 'Product',
              itemable: { id: 17, title: 'تيست1' },
              expectedPrice: 44444444,
              quantity: 1,
              unitId: 9,
            },
          ],
          clientPrice: 52000000,
          totalPrice: 44444444,
          createdAt: '2026-09-23 12:42:40',
        },
      ],
      quoteStagesCount: 1,
      quoteItemsCount: 1,
      createdAt: '2026-09-23 11:56:21',
    });
  });
});
