import { describe, expect, it } from 'vitest';
import IndexProjectTypeParams from '../index.project-type.params';
describe('IndexProjectTypeParams', () => {
  it('maps pagination and filters', () => {
    expect(new IndexProjectTypeParams('mall', 2, 20, 1, '2026-06-15', 4).toMap()).toEqual({
      word: 'mall',
      page: 2,
      per_page: 20,
      with_pagination: 1,
      date_remove: '2026-06-15',
      project_type: 4,
    });
  });
});
