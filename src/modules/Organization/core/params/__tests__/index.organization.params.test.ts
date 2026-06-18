import { describe, expect, it } from 'vitest';
import IndexOrganizationParams from '../index.organization.params';

describe('IndexOrganizationParams', () => {
  it('maps default pagination', () => {
    expect(new IndexOrganizationParams().toMap()).toEqual({
      with_pagination: 1,
      page: 1,
      per_page: 10,
    });
  });

  it('maps search, date remove, and organization type filters', () => {
    expect(new IndexOrganizationParams('build', 2, 25, 1, '2026-06-18', 9).toMap()).toEqual({
      word: 'build',
      with_pagination: 1,
      page: 2,
      per_page: 25,
      date_remove: '2026-06-18',
      organization_type_id: 9,
    });
  });
});
