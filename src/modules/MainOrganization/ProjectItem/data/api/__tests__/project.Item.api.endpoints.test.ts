import { describe, expect, it } from 'vitest';
import { ProjectItemApiEndpoints } from '../project.Item.api.endpoints';

describe('ProjectItemApiEndpoints', () => {
  it('uses dashboard item endpoints', () => {
    const endpoints = new ProjectItemApiEndpoints();

    expect(endpoints.index).toContain('mainportal/fetch_project_items');
    expect(endpoints.show).toContain('mainportal/show_project_item');
    expect(endpoints.store).toContain('mainportal/store_project_item');
    expect(endpoints.update).toContain('mainportal/update_project_item');
    expect(endpoints.delete).toContain('mainportal/delete_project_item');
  });
});
