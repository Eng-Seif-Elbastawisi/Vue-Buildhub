import { describe, expect, it } from 'vitest';
import { SuppliersEndpoints } from '../Suppliers.api.endpoints';

describe('SuppliersEndpoints', () => {
  it('uses dashboard endpoints', () => {
    const endpoints = new SuppliersEndpoints();
    expect(endpoints.index).toContain('organization/fetch_suppliers');
    expect(endpoints.store).toContain('organization/store_supplier');
    expect(endpoints.delete).toContain('organization/delete_supplier');
  });
});
