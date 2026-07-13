import { describe, expect, it, vi } from 'vitest';
import ProjectApiService from '../project.api-service';

vi.mock('@/stores/user', () => ({
  useUserStore: vi.fn(() => ({ user: { type: 1 } })),
}));

describe('ProjectApiService', () => {
  it('returns the same singleton instance', () => {
    expect(ProjectApiService.getInstance()).toBe(ProjectApiService.getInstance());
  });

  it('maps custom project actions to API endpoints', async () => {
    const service = ProjectApiService.getInstance();
    const spy = vi.spyOn(service, 'customPost').mockResolvedValue({} as never);

    await service.convertMeasurementToProject({ project_id: 1 });
    await service.storeVersion({ project_id: 1 });
    await service.reviseVersion({ project_id: 1 });
    await service.fetchProjectStatusHistories({ project_id: 1 });

    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('/mainportal/convert_measurement_to_project'),
      { project_id: 1 },
    );
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('/mainportal/store_version'), {
      project_id: 1,
    });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('/mainportal/revise_version'), {
      project_id: 1,
    });
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('/mainportal/fetch_project_status_histories'),
      { project_id: 1 },
    );
  });
});
