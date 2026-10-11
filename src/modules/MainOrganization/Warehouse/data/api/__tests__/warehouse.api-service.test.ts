import { describe, expect, it, vi } from 'vitest';
import WarehouseApiService from '../warehouse.api-service';

vi.mock('@/stores/user', () => ({
  useUserStore: () => ({ user: { type: 2 } }),
}));

describe('WarehouseApiService', () => {
  it('returns the same singleton', () => {
    expect(WarehouseApiService.getInstance()).toBe(WarehouseApiService.getInstance());
  });
});
