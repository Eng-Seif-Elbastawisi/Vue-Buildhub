import { describe, expect, it } from 'vitest';
import ShowMeasurementParams from '../show.measurement.params';

describe('ShowMeasurementParams', () => {
  it('maps and validates the id', () => {
    expect(new ShowMeasurementParams(4).toMap()).toEqual({ measurement_unit_id: 4 });
    expect(new ShowMeasurementParams(4).validate().isValid).toBe(true);
    expect(new ShowMeasurementParams(undefined as unknown as number).validate().isValid).toBe(true);
  });
});
