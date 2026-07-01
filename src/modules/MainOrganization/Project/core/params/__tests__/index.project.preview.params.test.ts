import { describe, expect, it } from 'vitest';
import IndexProjectPreviewParams from '../index.project.preview.params';

describe('IndexProjectPreviewParams', () => {
  it('adds optional preview filters to the index map', () => {
    const params = new IndexProjectPreviewParams('visit', 2, 20, 1, '2026-06-25', 10, 12);

    expect(params.toMap()).toMatchObject({
      word: 'visit',
      page: 2,
      per_page: 20,
      date_remove: '2026-06-25',
      project_id: 10,
      project_preview_id: 12,
    });
  });
});
