import { describe, it, expect } from 'vitest';
import ShowProjectParams from '../show.project.params';

describe('ShowProjectParams', () => {
  it('should instantiate correctly and convert to map', () => {
    const params = new ShowProjectParams({
      projectId: 456,
      allLocales: true,
    });

    expect(params.projectId).toBe(456);
    expect(params.allLocales).toBe(true);

    const map = params.toMap();
    expect(map.project_id).toBe(456);
  });

  it('should have required validation rule', () => {
    const result = ShowProjectParams.validation.validate({ projectId: undefined });

    expect(result).toEqual({
      isValid: false,
      errors: [{ field: 'projectId', message: 'projectId is required' }],
    });
  });
});
