import { describe, expect, it } from 'vitest';

import ExecutionQuoteProjectModel from '../execution.quote.project.model';

describe('ExecutionQuoteProjectModel', () => {
  it('maps the project client with the shared title model', () => {
    const project = ExecutionQuoteProjectModel.fromJson({
      id: 207,
      client: { id: '30', title: 'Client' },
      title: 'Project',
      description: null,
      date: '2026-08-09',
      created_at: '2026-08-09 06:13:43',
    });

    expect(project).toMatchObject({
      id: 207,
      client: { id: 30, title: 'Client' },
      title: 'Project',
      description: null,
      date: '2026-08-09',
      createdAt: '2026-08-09 06:13:43',
    });
  });
});
