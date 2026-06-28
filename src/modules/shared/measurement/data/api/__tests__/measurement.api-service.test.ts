import { describe, expect, it } from 'vitest';
import MeasurementApiService from '../measurement.api-service';

describe('MeasurementApiService', () => {
  it('returns the same singleton instance', () => {
    expect(MeasurementApiService.getInstance()).toBe(MeasurementApiService.getInstance());
  });

  it('maps base API actions to measurement endpoints', () => {
    const service = MeasurementApiService.getInstance() as unknown as {
      endpoints: Record<string, string>;
    };

    expect(service.endpoints.index).toContain('mainportal/fetch_measurement_units');
    expect(service.endpoints.create).toContain('mainportal/store_measurement_unit');
    expect(service.endpoints.update).toContain('mainportal/update_measurement_unit');
    expect(service.endpoints.delete).toContain('mainportal/delete_measurement_unit');
  });
});
