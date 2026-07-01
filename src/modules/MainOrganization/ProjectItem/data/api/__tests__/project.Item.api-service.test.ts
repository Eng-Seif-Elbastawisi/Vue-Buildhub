import { describe, expect, it } from 'vitest';
import ProjectItemApiService from '../project.Item.api-service';

describe('ProjectItemApiService', () => {
  it('returns the same singleton instance', () => {
    expect(ProjectItemApiService.getInstance()).toBe(ProjectItemApiService.getInstance());
  });

  it('maps base API actions to item endpoints', () => {
    const service = ProjectItemApiService.getInstance() as unknown as {
      endpoints: Record<string, string>;
    };

    expect(service.endpoints.index).toContain('mainportal/fetch_project_items');
    expect(service.endpoints.create).toContain('mainportal/store_project_item');
    expect(service.endpoints.update).toContain('mainportal/update_project_item');
    expect(service.endpoints.delete).toContain('mainportal/delete_project_item');
  });
});
