import { describe, expect, it } from 'vitest';
import ConvertMeasurementParams from '../convert.measurement.params';

describe('ConvertMeasurementParams', () => {
  it('should instantiate and map project id', () => {
    const params = new ConvertMeasurementParams({
      projectId: 456,
      allLocales: true,
    });

    expect(params.projectId).toBe(456);
    expect(params.toMap()).toEqual({ project_id: 456 });
  });

  it('should have required projectId validation rule', () => {
    const result = ConvertMeasurementParams.validation.validate({ projectId: undefined });

    expect(result).toEqual({
      isValid: false,
      errors: [{ field: 'projectId', message: 'projectId is required' }],
    });
  });
});
