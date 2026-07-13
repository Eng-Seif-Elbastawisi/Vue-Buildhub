import { describe, expect, it } from 'vitest';
import ProjectHistoryModel from '../project.history.model';

describe('ProjectHistoryModel', () => {
  it('parses project history response data', () => {
    const model = ProjectHistoryModel.fromJson({
      project: {
        id: 27,
        client: { id: 5, title: 'you' },
        title: 'Project title',
        description: 'Project description',
        date: '2026-07-12',
        created_at: '2026-07-12 08:37:09',
      },
      histories: [
        {
          id: 14,
          status: 4,
          created_at: '2026-07-12 09:49:51',
        },
      ],
    });

    expect(model.project?.id).toBe(27);
    expect(model.project?.client?.title).toBe('you');
    expect(model.histories).toHaveLength(1);
    expect(model.histories[0]).toEqual({
      id: 14,
      status: 4,
      created_at: '2026-07-12 09:49:51',
    });
  });
});
