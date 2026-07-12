import { describe, expect, it } from 'vitest';
import ProjectModel from '../../../core/models/project.model';
import ProjectShowModel from '../../../core/models/project.show.model';
import ProjectRepository from '../project.repository';

describe('ProjectRepository', () => {
  it('returns the same singleton instance', () => {
    expect(ProjectRepository.getInstance()).toBe(ProjectRepository.getInstance());
  });

  it('parses project and project list responses', () => {
    const repository = ProjectRepository.getInstance() as unknown as {
      parseItem(data: Record<string, unknown>): ProjectShowModel;
      parseList(data: unknown): ProjectModel[];
      config: { hasPagination: boolean; dataKey: string; paginationKey: string };
    };

    expect(repository.config).toEqual({
      hasPagination: true,
      dataKey: 'data',
      paginationKey: 'meta',
    });

    expect(repository.parseItem({ id: 3, title: 'Commercial project' })).toBeInstanceOf(
      ProjectShowModel,
    );
    expect(repository.parseList([{ id: 1 }, { id: 2 }])).toEqual([
      expect.any(ProjectModel),
      expect.any(ProjectModel),
    ]);
    expect(repository.parseList({})).toEqual([]);
  });

  it('returns DataState results for custom project actions', async () => {
    const repository = ProjectRepository.getInstance();
    const apiService = ProjectApiService.getInstance();

    vi.spyOn(apiService, 'convertMeasurementToProject').mockResolvedValue({
      data: { status: true, message: 'Converted' },
      statusCode: 200,
    });
    vi.spyOn(apiService, 'storeVersion').mockResolvedValue({
      data: { status: false, message: 'Cannot store version' },
      statusCode: 400,
    });

    const success = await repository.convertMeasurementToProject({ project_id: 1 });
    const failed = await repository.storeVersion({ project_id: 1 });

    expect(success).toBeInstanceOf(DataSuccess);
    expect(success.message).toBe('Converted');
    expect(failed).toBeInstanceOf(DataFailed);
    expect(failed.error?.displayMessage).toBe('Cannot store version');
  });
});
