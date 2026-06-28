import { describe, expect, it } from 'vitest';
import { MeasurementEndpoints } from '../measurement.api.endpoints';

describe('MeasurementEndpoints', () => {
  it('uses dashboard measurement endpoints', () => {
    const endpoints = new MeasurementEndpoints();

    expect(endpoints.index).toContain('mainportal/fetch_measurement_units');
    expect(endpoints.show).toContain('mainportal/show_measurement_unit');
    expect(endpoints.store).toContain('mainportal/store_measurement_unit');
    expect(endpoints.update).toContain('mainportal/update_measurement_unit');
    expect(endpoints.delete).toContain('mainportal/delete_measurement_unit');
  });
});
