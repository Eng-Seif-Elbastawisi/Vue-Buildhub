import { describe, expect, it } from 'vitest';
import { SuppliersEndpoints } from '../Suppliers.api.endpoints';

describe('SuppliersEndpoints', () => {
  it('uses dashboard endpoints', () => {
    const endpoints = new SuppliersEndpoints();
    expect(endpoints.index).toContain('dashboard/fetch_suppliers');
    expect(endpoints.store).toContain('dashboard/store_supplier');
    expect(endpoints.delete).toContain('dashboard/delete_supplier');
  });
});
