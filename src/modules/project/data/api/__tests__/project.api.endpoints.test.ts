import { describe, expect, it } from 'vitest';
import { ProjectApiEndpoints } from '../project.api.endpoints';
describe('ProjectApiEndpoints', () => {
  it('uses dashboard project endpoints', () => {
    const endpoints = new ProjectApiEndpoints();
    expect(endpoints.index).toContain('dashboard/fetch_project');
    expect(endpoints.store).toContain('dashboard/store_project');
    expect(endpoints.delete).toContain('dashboard/delete_project');
  });
});
