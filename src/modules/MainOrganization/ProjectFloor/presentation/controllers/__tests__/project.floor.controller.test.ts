import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import BaseController from '@/base/Presentation/Controller/baseController';
import { FloorNumber } from '../../../core/constants/floor.number.enum';
import ProjectFloorShowModel from '../../../core/models/project.floor.show.model';
import EditProjectFloorParams from '../../../core/params/edit.project.floor.params';
import ProjectFloorController from '../project.floor.controller';

const mocks = vi.hoisted(() => ({
  clearFormData: vi.fn(),
  push: vi.fn(),
}));

vi.mock('@/stores/formsStore', () => ({
  useFormsStore: vi.fn(() => ({ clearFormData: mocks.clearFormData })),
}));

vi.mock('@/router', () => ({
  default: { push: mocks.push },
}));

describe('ProjectFloorController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return a singleton instance', () => {
    const instance1 = ProjectFloorController.getInstance();
    const instance2 = ProjectFloorController.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('returns to the project show page after a successful floor update', async () => {
    const responseModel = new ProjectFloorShowModel({ id: 33, project_id: 24 });
    const updateSpy = vi
      .spyOn(BaseController.prototype, 'update')
      .mockResolvedValue(new DataSuccess({ data: responseModel }));
    const params = new EditProjectFloorParams({
      id: 33,
      project_id: 24,
      project_preview_id: 15,
      floor_number: FloorNumber.GROUND_FLOOR,
      site_description: 'Current site description',
      technical_general_notes: 'Current technical notes',
      inspection_recommendations: 'Current recommendations',
      spaces: [{ space_id: 8, length: 12.5, width: 8.25, height: 3.2 }],
    });

    await ProjectFloorController.getInstance().update(params, undefined, 'edit-floor-form');

    expect(mocks.clearFormData).toHaveBeenCalledWith('edit-floor-form');
    expect(mocks.push).toHaveBeenCalledWith({
      name: 'show-project',
      params: { project_id: 24 },
    });

    updateSpy.mockRestore();
  });
});
