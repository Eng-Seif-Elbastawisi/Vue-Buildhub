import { describe, expect, it } from 'vitest';
import { ProjectTypeApiEndpoints } from '../project-type.api.endpoints';
describe('ProjectTypeApiEndpoints', () => {
  it('uses dashboard project endpoints', () => {
    const endpoints = new ProjectTypeApiEndpoints();
    expect(endpoints.index).toContain('dashboard/fetch_project');
    expect(endpoints.store).toContain('dashboard/store_project');
    expect(endpoints.delete).toContain('dashboard/delete_project');
  });
});
