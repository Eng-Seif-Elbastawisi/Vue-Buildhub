import { describe, expect, it, vi } from 'vitest';
import { WarehouseApiEndpoints } from '../warehouse.api.endpoints';

vi.mock('@/stores/user', () => ({
  useUserStore: () => ({ user: { type: 2 } }),
}));

describe('WarehouseApiEndpoints', () => {
  it('uses organization warehouse endpoints', () => {
    const endpoints = new WarehouseApiEndpoints();
    expect(endpoints.index).toContain('organization/fetch_Warehouse');
    expect(endpoints.store).toContain('organization/store_Warehouse');
    expect(endpoints.update).toContain('organization/update_Warehouse');
    expect(endpoints.show).toContain('organization/show_Warehouse');
    expect(endpoints.delete).toContain('organization/delete_Warehouse');
  });
});
