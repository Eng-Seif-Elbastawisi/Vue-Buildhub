import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import BaseController from '@/base/Presentation/Controller/baseController';
import ProjectPreviewShowModel from '../../../core/models/project.preview.show.model';
import EditProjectPreviewParams from '../../../core/params/edit.project.preview.params';
import ProjectPreviewController from '../project.preview.controller';

const mocks = vi.hoisted(() => ({
  clearFormData: vi.fn(),
  push: vi.fn(),
}));

vi.mock('@/stores/user', () => ({
  useUserStore: vi.fn(() => ({ user: { type: 2 } })),
}));

vi.mock('@/stores/formsStore', () => ({
  useFormsStore: vi.fn(() => ({ clearFormData: mocks.clearFormData })),
}));

vi.mock('@/router', () => ({
  default: { push: mocks.push },
}));

describe('ProjectPreviewController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a singleton instance', () => {
    expect(ProjectPreviewController.getInstance()).toBe(ProjectPreviewController.getInstance());
  });

  it('returns to the project show page after a successful update', async () => {
    const responseModel = new ProjectPreviewShowModel({ id: 18, project_id: 7 });
    const updateSpy = vi
      .spyOn(BaseController.prototype, 'update')
      .mockResolvedValue(new DataSuccess({ data: responseModel }));
    const params = new EditProjectPreviewParams({
      id: 18,
      project_id: 7,
      engineer_id: 15,
      preview_date: '2026-06-25',
      preview_time: '10:30:00',
    });

    await ProjectPreviewController.getInstance().update(params, undefined, 'edit-form');

    expect(mocks.clearFormData).toHaveBeenCalledWith('edit-form');
    expect(mocks.push).toHaveBeenCalledWith('/organization/project/show/7');

    updateSpy.mockRestore();
  });
});
