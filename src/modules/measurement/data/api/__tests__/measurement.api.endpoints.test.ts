import { describe, expect, it } from 'vitest';
import { MeasurementEndpoints } from '../measurement.api.endpoints';

describe('MeasurementEndpoints', () => {
  it('uses dashboard measurement endpoints', () => {
    const endpoints = new MeasurementEndpoints();

    expect(endpoints.index).toContain('dashboard/index_measurements');
    expect(endpoints.show).toContain('dashboard/show_measurement');
    expect(endpoints.store).toContain('dashboard/store_measurement');
    expect(endpoints.update).toContain('dashboard/update_measurement');
    expect(endpoints.delete).toContain('dashboard/delete_measurement');
  });
});
