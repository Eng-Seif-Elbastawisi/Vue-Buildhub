import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useUserStore } from '@/stores/user';
import { ProjectApiEndpoints } from '../project.api.endpoints';

vi.mock('@/stores/user', () => ({
  useUserStore: vi.fn(() => ({ user: { type: 1 } })),
}));

describe('ProjectApiEndpoints', () => {
  beforeEach(() => {
    vi.mocked(useUserStore).mockReturnValue({ user: { type: 1 } } as never);
  });

  it('builds mainportal project endpoints for master users', () => {
    const endpoints = new ProjectApiEndpoints();

    expect(endpoints.index).toContain('mainportal/fetch_projects');
    expect(endpoints.show).toContain('mainportal/show_project');
    expect(endpoints.store).toContain('mainportal/store_project');
    expect(endpoints.update).toContain('mainportal/update_project');
    expect(endpoints.delete).toContain('mainportal/delete_project');
    expect(endpoints.convertMeasurementToProject).toContain(
      'mainportal/convert_measurement_to_project',
    );
    expect(endpoints.storeVersion).toContain('mainportal/store_version');
    expect(endpoints.reviseVersion).toContain('mainportal/revise_version');
    expect(endpoints.changeProjectStatus).toContain('mainportal/change_project_status');
    expect(endpoints.fetchProjectStatusHistories).toContain(
      'mainportal/fetch_project_status_histories',
    );
  });

  it('builds organization project endpoints for non-master users', () => {
    vi.mocked(useUserStore).mockReturnValue({ user: { type: 2 } } as never);

    const endpoints = new ProjectApiEndpoints();

    expect(endpoints.index).toContain('organization/fetch_projects');
    expect(endpoints.show).toContain('organization/show_project');
    expect(endpoints.store).toContain('organization/store_project');
    expect(endpoints.update).toContain('organization/update_project');
    expect(endpoints.delete).toContain('organization/delete_project');
    expect(endpoints.convertMeasurementToProject).toContain(
      'organization/convert_measurement_to_project',
    );
    expect(endpoints.storeVersion).toContain('organization/store_version');
    expect(endpoints.reviseVersion).toContain('organization/revise_version');
    expect(endpoints.changeProjectStatus).toContain('organization/change_project_status');
    expect(endpoints.fetchProjectStatusHistories).toContain(
      'organization/fetch_project_status_histories',
    );
  });
});
