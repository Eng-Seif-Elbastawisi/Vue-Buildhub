import { describe, expect, it, vi } from 'vitest';
import {
  DataFailed,
  DataSuccess,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import ProjectModel from '../../../core/models/project.model';
import ProjectShowModel from '../../../core/models/project.show.model';
import ProjectApiService from '../../api/project.api-service';
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
    vi.spyOn(apiService, 'changeProjectStatus').mockResolvedValue({
      data: { status: true, message: 'Status changed' },
      statusCode: 200,
    });
    vi.spyOn(apiService, 'fetchProjectStatusHistories').mockResolvedValue({
      data: {
        status: true,
        message: 'Project histories fetched successfully.',
        data: {
          project: { id: 27, title: 'Project History' },
          histories: [{ id: 14, status: 4, created_at: '2026-07-12 09:49:51' }],
        },
      },
      statusCode: 200,
    });
    const success = await repository.convertMeasurementToProject({ project_id: 1 });
    const failed = await repository.storeVersion({ project_id: 1 });
    const changed = await repository.changeProjectStatus({
      project_id: 1,
      status: 5,
      notes: 'Approved',
    });
    const history = await repository.fetchProjectStatusHistories({ project_id: 27 });

    expect(success).toBeInstanceOf(DataSuccess);
    expect(success.message).toBe('Converted');
    expect(failed).toBeInstanceOf(DataFailed);
    expect(failed.error?.displayMessage).toBe('Cannot store version');
    expect(changed).toBeInstanceOf(DataSuccess);
    expect(changed.message).toBe('Status changed');
    expect(history).toBeInstanceOf(DataSuccess);
    expect(history.data?.project?.title).toBe('Project History');
    expect(history.data?.histories[0].status).toBe(4);
  });
});
