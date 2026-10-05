import { describe, expect, it } from 'vitest';

import ExecutionQuoteClientModel from '../execution.quote.client.model';

describe('ExecutionQuoteClientModel', () => {
  it('maps the client and its shared related models', () => {
    const client = ExecutionQuoteClientModel.fromJson({
      id: 30,
      organization: { id: 1, name: 'Techlab' },
      employee: { id: 4, name: 'Employee' },
      name: 'Client',
      type: '1',
      client_source: { id: '11', title: 'Website' },
      status: '2',
      created_at: '2026-07-22 13:29:29',
    });

    expect(client).toMatchObject({
      id: 30,
      organization: { id: 1, name: 'Techlab' },
      employee: { id: 4, name: 'Employee' },
      name: 'Client',
      type: 1,
      clientSource: { id: 11, title: 'Website' },
      status: 2,
      createdAt: '2026-07-22 13:29:29',
    });
  });
});
