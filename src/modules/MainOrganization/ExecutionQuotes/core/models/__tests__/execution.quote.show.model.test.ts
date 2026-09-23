import { describe, expect, it } from 'vitest';

import ExecutionQuoteShowModel from '../execution.quote.show.model';

describe('ExecutionQuoteShowModel', () => {
  it('maps the execution quote show resource', () => {
    const quote = ExecutionQuoteShowModel.fromJson({
      id: 37,
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
        client_source: null,
        status: 1,
        created_at: '2026-07-22 13:29:29',
      },
      quote_type: { id: 1, title: 'Lump_SUM' },
      price_employee: { id: 92, name: 'fwffefefe' },
      quote_stages: [
        { id: 1, items: [{ id: 1 }, { id: 2 }, { id: 3 }] },
      ],
      created_at: '2026-09-23 11:56:21',
    });

    expect(quote).toMatchObject({
      id: 37,
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
        clientSource: null,
        status: 1,
        createdAt: '2026-07-22 13:29:29',
      },
      quoteType: { id: 1, title: 'Lump_SUM' },
      priceEmployee: { id: 92, name: 'fwffefefe' },
      quoteStagesCount: 1,
      quoteItemsCount: 3,
      createdAt: '2026-09-23 11:56:21',
    });
  });
});
