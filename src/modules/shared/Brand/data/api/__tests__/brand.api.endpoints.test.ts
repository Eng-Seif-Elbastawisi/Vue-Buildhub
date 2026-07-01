import { describe, expect, it, vi } from 'vitest';
import { BrandApiEndpoints } from '../brand.api.endpoints';

const mockUserStore = vi.hoisted(() => ({
  user: { type: 1 },
}));

vi.mock('@/stores/user', () => ({
  useUserStore: () => mockUserStore,
}));

describe('BrandApiEndpoints', () => {
  it('uses role-specific brand endpoints', () => {
    const endpoints = new BrandApiEndpoints();
    expect(endpoints.index).toContain('mainportal/fetch_brands');
    expect(endpoints.store).toContain('mainportal/store_brand');
    expect(endpoints.delete).toContain('mainportal/delete_brand');
  });
});
