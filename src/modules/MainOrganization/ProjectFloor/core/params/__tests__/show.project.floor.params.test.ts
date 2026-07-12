import { describe, it, expect } from 'vitest';
import ShowProjectFloorParams from '../show.project.floor.params';

describe('ShowProjectFloorParams', () => {
  it('should instantiate correctly and convert to map', () => {
    const params = new ShowProjectFloorParams({
      project_floor_id: 456,
      allLocales: true,
    });

    expect(params.project_floor_id).toBe(456);
    expect(params.allLocales).toBe(true);

    expect(params.toMap()).toEqual({
      project_floor_id: 456,
      allLocales: true,
    });
  });

  it('should have required validation rule', () => {
    const result = ShowProjectFloorParams.validation.validate({ project_id: undefined });

    expect(result).toEqual({
      isValid: false,
      errors: [{ field: 'project_id', message: 'project_id is required' }],
    });
  });
});
