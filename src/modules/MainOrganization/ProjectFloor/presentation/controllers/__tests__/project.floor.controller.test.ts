import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { FloorNumber } from '../../../core/constants/floor.number.enum';
import AddProjectFloorParams from '../../../core/params/add.project.floor.params';
import EditProjectFloorParams from '../../../core/params/edit.project.floor.params';
import ProjectFloorApiService from '../../../data/api/project.floor.api-service';
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

  it('keeps the assessment page open after a successful floor create', async () => {
    vi.spyOn(ProjectFloorApiService.getInstance(), 'create').mockResolvedValue({
      statusCode: 200,
      data: { status: true, data: { id: 33, project_id: 24 } },
    });
    const params = new AddProjectFloorParams({
      project_id: 24,
      project_preview_id: 15,
      site_description: 'Current site description',
      technical_general_notes: 'Current technical notes',
      inspection_recommendations: 'Current recommendations',
      floors: [
        {
          floor_number: FloorNumber.GROUND_FLOOR,
          spaces: [{ space_id: 8, length: 12.5, width: 8.25, height: 3.2 }],
        },
      ],
    });

    const result = await ProjectFloorController.getInstance().create(
      params,
      undefined,
      'add-floor-form',
    );

    expect(result).toBeInstanceOf(DataSuccess);
    expect(mocks.clearFormData).toHaveBeenCalledWith('add-floor-form');
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it('returns to the project show page after a successful floor update', async () => {
    vi.spyOn(ProjectFloorApiService.getInstance(), 'update').mockResolvedValue({
      statusCode: 200,
      data: { status: true, data: { id: 33, project_id: 24 } },
    });
    const params = new EditProjectFloorParams({
      id: 33,
      project_id: 24,
      project_preview_id: 15,
      site_description: 'Current site description',
      technical_general_notes: 'Current technical notes',
      inspection_recommendations: 'Current recommendations',
      floors: [
        {
          project_floor_id: 33,
          floor_number: FloorNumber.GROUND_FLOOR,
          spaces: [{ space_id: 8, length: 12.5, width: 8.25, height: 3.2 }],
        },
      ],
    });

    await ProjectFloorController.getInstance().update(params, undefined, 'edit-floor-form');

    expect(mocks.clearFormData).toHaveBeenCalledWith('edit-floor-form');
    expect(mocks.push).toHaveBeenCalledWith({
      name: 'show-project',
      params: { project_id: 24 },
    });
  });

  it('updates a floor in place without navigating when requested by the dialog', async () => {
    vi.spyOn(ProjectFloorApiService.getInstance(), 'update').mockResolvedValue({
      statusCode: 200,
      data: { status: true, data: { id: 33, project_id: 24 } },
    });
    const params = new EditProjectFloorParams({
      project_floor_id: 33,
      project_id: 24,
      project_preview_id: 15,
      spaces: [{ space_id: 8, length: 12.5, width: 8.25, height: 3.2, notes: null }],
    });

    const result = await ProjectFloorController.getInstance().updateWithoutNavigation(params);

    expect(result).toBeInstanceOf(DataSuccess);
    expect(mocks.push).not.toHaveBeenCalled();
  });
});
