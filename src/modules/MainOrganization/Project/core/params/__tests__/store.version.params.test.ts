import { describe, expect, it } from 'vitest';
import StoreVersionParams from '../store.version.params';

describe('StoreVersionParams', () => {
  it('should instantiate and map project id', () => {
    const params = new StoreVersionParams({
      projectId: 321,
      allLocales: true,
    });

    expect(params.projectId).toBe(321);
    expect(params.toMap()).toEqual({ project_id: 321 });
  });

  it('should have required projectId validation rule', () => {
    const result = StoreVersionParams.validation.validate({ projectId: undefined });

    expect(result).toEqual({
      isValid: false,
      errors: [{ field: 'projectId', message: 'projectId is required' }],
    });
  });
});
