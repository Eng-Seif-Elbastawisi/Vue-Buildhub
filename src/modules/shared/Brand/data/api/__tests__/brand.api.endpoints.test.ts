import { describe, expect, it } from 'vitest';
import { BrandApiEndpoints } from '../brand.api.endpoints';

describe('BrandApiEndpoints', () => {
  it('uses dashboard endpoints', () => {
    const endpoints = new BrandApiEndpoints();
    expect(endpoints.index).toContain('dashboard/fetch_brand');
    expect(endpoints.store).toContain('dashboard/store_brand');
    expect(endpoints.delete).toContain('dashboard/delete_brand');
  });
});
