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

    expect(service.endpoints.index).toContain('dashboard/index_measurements');
    expect(service.endpoints.create).toContain('dashboard/store_measurement');
    expect(service.endpoints.update).toContain('dashboard/update_measurement');
    expect(service.endpoints.delete).toContain('dashboard/delete_measurement');
  });
});
