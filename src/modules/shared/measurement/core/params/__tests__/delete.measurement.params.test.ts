import { describe, expect, it } from 'vitest';
import DeleteMeasurementParams from '../delete.measurement.params';

describe('DeleteMeasurementParams', () => {
  it('maps and validates the id', () => {
    expect(new DeleteMeasurementParams(4).toMap()).toEqual({ id: 4 });
    expect(new DeleteMeasurementParams(4).validate().isValid).toBe(true);
    expect(new DeleteMeasurementParams(null as unknown as number).validate().isValid).toBe(false);
  });
});
