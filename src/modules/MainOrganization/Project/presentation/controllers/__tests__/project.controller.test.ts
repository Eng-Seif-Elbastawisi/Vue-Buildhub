import { describe, it, expect, vi } from 'vitest';
import {
  DataFailed,
  DataSuccess,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { ErrorModel, ErrorType } from '@/base/Core/NetworkStructure/Resources/errors/errorModel';
import ProjectHistoryModel from '../../../core/models/project.history.model';
import ProjectShowModel from '../../../core/models/project.show.model';
import ProjectRepository from '../../../data/repositories/project.repository';
import ProjectController from '../project.controller';
import BaseController from '@/base/Presentation/Controller/baseController';

const mocks = vi.hoisted(() => ({
  clearFormData: vi.fn(),
  push: vi.fn(),
  toastError: vi.fn(),
  userType: 1,
}));

vi.mock('@/base/Presentation/Dialogs/dialog.manager', () => ({
  dialogManager: {
    toastError: mocks.toastError,
  },
}));

vi.mock('@/stores/user', () => ({
  useUserStore: vi.fn(() => ({ user: { type: mocks.userType } })),
}));

vi.mock('@/stores/formsStore', () => ({
  useFormsStore: vi.fn(() => ({ clearFormData: mocks.clearFormData })),
}));

vi.mock('@/router', () => ({
  default: { push: mocks.push },
}));

describe('ProjectController', () => {
  const params = {
    toMap: () => ({}),
    validate: () => ({ isValid: true, errors: [] }),
    validateOrThrow: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.userType = 1;
    mocks.push.mockResolvedValue(undefined);
  });

  it('should return a singleton instance', () => {
    const instance1 = ProjectController.getInstance();
    const instance2 = ProjectController.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('shows error toasts for project status actions', async () => {
    const repository = ProjectRepository.getInstance();
    const controller = ProjectController.getInstance();
    const failed = (message: string) =>
      new DataFailed<void>({
        error: new ErrorModel(message, ErrorType.serviceSide),
      });

    vi.spyOn(repository, 'convertMeasurementToProject').mockResolvedValue(failed('Convert failed'));
    vi.spyOn(repository, 'storeVersion').mockResolvedValue(failed('Store version failed'));
    vi.spyOn(repository, 'reviseVersion').mockResolvedValue(failed('Revise version failed'));
    vi.spyOn(repository, 'changeProjectStatus').mockResolvedValue(failed('Change status failed'));

    await controller.convertMeasurementToProject({ project_id: 1 });
    await controller.storeVersion({ project_id: 1 });
    await controller.reviseVersion({ project_id: 1 });
    await controller.changeProjectStatus({ project_id: 1, status: 5, notes: 'Approved' });

    expect(mocks.toastError).toHaveBeenNthCalledWith(1, 'Convert failed');
    expect(mocks.toastError).toHaveBeenNthCalledWith(2, 'Store version failed');
    expect(mocks.toastError).toHaveBeenNthCalledWith(3, 'Revise version failed');
  });

  it('stores project history data in the history state', async () => {
    const repository = ProjectRepository.getInstance();
    const controller = ProjectController.getInstance();
    const historyModel = ProjectHistoryModel.fromJson({
      project: { id: 27, title: 'Project History' },
      histories: [{ id: 14, status: 4, created_at: '2026-07-12 09:49:51' }],
    });

    vi.spyOn(repository, 'fetchProjectStatusHistories').mockResolvedValue(
      new DataSuccess<ProjectHistoryModel>({ data: historyModel }),
    );

    const result = await controller.fetchProjectStatusHistories({
      toMap: () => ({ project_id: 27 }),
      validate: () => ({ isValid: true, errors: [] }),
      validateOrThrow: vi.fn(),
    });

    expect(result).toBeInstanceOf(DataSuccess);
    expect(controller.historyData.value?.project?.id).toBe(27);
    expect(controller.historyData.value?.histories).toHaveLength(1);
  });

  it('opens the mainportal preview route with the id parsed into the response model', async () => {
    const createSpy = vi.spyOn(BaseController.prototype, 'create').mockResolvedValue(
      new DataSuccess<ProjectShowModel>({
        data: new ProjectShowModel({ id: 42 }),
      }),
    );

    await ProjectController.getInstance().create(params, undefined, 'project-form', 'preview');

    expect(mocks.clearFormData).toHaveBeenCalledWith('project-form');
    expect(mocks.push).toHaveBeenCalledWith({
      path: '/mainportal/project_preview/add',
      query: { project_id: 42 },
    });

    createSpy.mockRestore();
  });

  it('opens the organization floor route without a preview id when floor is selected', async () => {
    mocks.userType = 2;
    const createSpy = vi.spyOn(BaseController.prototype, 'create').mockResolvedValue(
      new DataSuccess<ProjectShowModel>({
        data: new ProjectShowModel({ id: 73 }),
      }),
    );

    await ProjectController.getInstance().create(params, undefined, 'project-form', 'floor');

    expect(mocks.push).toHaveBeenCalledWith({
      path: '/organization/project_floor/add',
      query: { project_id: 73 },
    });
    expect(mocks.push.mock.calls[0]?.[0]).not.toHaveProperty('query.project_preview_id');

    createSpy.mockRestore();
  });

  it('does not navigate or clear the form when a successful response has no project id', async () => {
    const createSpy = vi.spyOn(BaseController.prototype, 'create').mockResolvedValue(
      new DataSuccess<ProjectShowModel>({
        data: new ProjectShowModel({}),
      }),
    );

    await ProjectController.getInstance().create(params, undefined, 'project-form', 'floor');

    expect(mocks.push).not.toHaveBeenCalled();
    expect(mocks.clearFormData).not.toHaveBeenCalled();
    expect(mocks.toastError).toHaveBeenCalledWith(
      'The project was created, but its ID was not returned. Please try again.',
    );

    createSpy.mockRestore();
  });

  it('does not navigate or clear the form when project creation fails', async () => {
    const createSpy = vi.spyOn(BaseController.prototype, 'create').mockResolvedValue(
      new DataFailed<ProjectShowModel>({
        error: new ErrorModel('Create failed', ErrorType.serviceSide),
      }),
    );

    await ProjectController.getInstance().create(params, undefined, 'project-form', 'preview');

    expect(mocks.push).not.toHaveBeenCalled();
    expect(mocks.clearFormData).not.toHaveBeenCalled();

    createSpy.mockRestore();
  });
});
