import { describe, it, expect } from 'vitest';
import ShowProjectFloorParams from '../show.project.floor.params';

describe('ShowProjectFloorParams', () => {
  it('should instantiate correctly and convert to map', () => {
    const params = new ShowProjectFloorParams({
      project_floor_id: 456,
      project_id: 24,
      project_preview_id: 15,
      allLocales: true,
    });

    expect(params.project_floor_id).toBe(456);
    expect(params.allLocales).toBe(true);

    expect(params.toMap()).toEqual({
      project_floor_id: 456,
      project_id: 24,
      project_preview_id: 15,
      allLocales: true,
    });
  });

  it('validates either a floor id or a project id for supported show requests', () => {
    expect(new ShowProjectFloorParams({ project_floor_id: 456 }).validate()).toEqual({
      isValid: true,
      errors: [],
    });
    expect(new ShowProjectFloorParams({ project_id: 24 }).validate()).toEqual({
      isValid: true,
      errors: [],
    });

    const result = new ShowProjectFloorParams({}).validate();

    expect(result).toEqual({
      isValid: false,
      errors: [{ field: 'project_floor_id', message: 'project_floor_id is required' }],
    });
    expect(new ShowProjectFloorParams({ project_floor_id: -1 }).validate().isValid).toBe(false);
  });
});
