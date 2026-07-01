import { describe, expect, it, vi } from 'vitest';
import { ProjectFloorApiEndpoints } from '../project.floor.api.endpoints';

vi.mock('@/stores/user', () => ({
  useUserStore: vi.fn(() => ({ user: { type: 1 } })),
}));

describe('ProjectFloorApiEndpoints', () => {
  it('builds project floor endpoint urls', () => {
    const endpoints = new ProjectFloorApiEndpoints();

    expect(endpoints.index).toContain('mainportal/fetch_project_floors');
    expect(endpoints.show).toContain('mainportal/show_project_floor');
    expect(endpoints.store).toContain('mainportal/store_project_floor');
    expect(endpoints.update).toContain('mainportal/update_project_floor');
    expect(endpoints.delete).toContain('mainportal/delete_project_floor');
  });
});
