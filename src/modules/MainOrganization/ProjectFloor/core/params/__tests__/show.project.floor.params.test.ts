import { describe, it, expect } from 'vitest';
import ShowProjectFloorParams from '../show.project.floor.params';

describe('ShowProjectFloorParams', () => {
  it('should instantiate correctly and convert to map', () => {
    const params = new ShowProjectFloorParams({
      projectFloorId: 456,
      allLocales: true,
    });

    expect(params.projectFloorId).toBe(456);
    expect(params.allLocales).toBe(true);

    expect(params.toMap()).toEqual({
      project_floor_id: 456,
      allLocales: true,
    });
  });

  it('should have required validation rule', () => {
    const result = ShowProjectFloorParams.validation.validate({ projectFloorId: undefined });

    expect(result).toEqual({
      isValid: false,
      errors: [{ field: 'projectFloorId', message: 'projectFloorId is required' }],
    });
  });
});
