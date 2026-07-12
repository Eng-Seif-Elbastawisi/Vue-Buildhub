import { describe, expect, it } from 'vitest';
import ReviseVersionParams from '../revise_version.params';

describe('ReviseVersionParams', () => {
  it('should instantiate and map project id', () => {
    const params = new ReviseVersionParams({
      projectId: 789,
      allLocales: true,
    });

    expect(params.projectId).toBe(789);
    expect(params.toMap()).toEqual({ project_id: 789 });
  });

  it('should have required projectId validation rule', () => {
    const result = ReviseVersionParams.validation.validate({ projectId: undefined });

    expect(result).toEqual({
      isValid: false,
      errors: [{ field: 'projectId', message: 'projectId is required' }],
    });
  });
});
