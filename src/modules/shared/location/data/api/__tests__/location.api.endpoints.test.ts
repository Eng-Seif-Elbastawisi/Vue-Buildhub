import { describe, expect, it } from 'vitest';
import { LocationApiEndpoints } from '../location.api.endpoints';

describe('LocationApiEndpoints', () => {
  it('uses dashboard location endpoints', () => {
    const endpoints = new LocationApiEndpoints();

    expect(endpoints.index).toContain('dashboard/fetch_location');
    expect(endpoints.store).toContain('dashboard/add_location');
    expect(endpoints.delete).toContain('dashboard/delete_location');
  });
});
