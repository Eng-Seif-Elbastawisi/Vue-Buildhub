import { describe, it, expect, vi } from 'vitest';
import { DataFailed } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { ErrorModel, ErrorType } from '@/base/Core/NetworkStructure/Resources/errors/errorModel';
import ProjectRepository from '../../../data/repositories/project.repository';
import ProjectController from '../project.controller';

const toastError = vi.hoisted(() => vi.fn());

vi.mock('@/base/Presentation/Dialogs/dialog.manager', () => ({
  dialogManager: {
    toastError,
  },
}));

vi.mock('@/stores/user', () => ({
  useUserStore: vi.fn(() => ({ user: { type: 1 } })),
}));

vi.mock('@/stores/formsStore', () => ({
  useFormsStore: vi.fn(() => ({ clearFormData: vi.fn() })),
}));

vi.mock('@/router', () => ({
  default: { push: vi.fn() },
}));

describe('ProjectController', () => {
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

    await controller.convertMeasurementToProject({ project_id: 1 });
    await controller.storeVersion({ project_id: 1 });
    await controller.reviseVersion({ project_id: 1 });

    expect(toastError).toHaveBeenNthCalledWith(1, 'Convert failed');
    expect(toastError).toHaveBeenNthCalledWith(2, 'Store version failed');
    expect(toastError).toHaveBeenNthCalledWith(3, 'Revise version failed');
  });
});
