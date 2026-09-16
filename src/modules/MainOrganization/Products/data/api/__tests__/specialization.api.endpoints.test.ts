import { describe, expect, it, vi } from 'vitest';
import { SpecializationApiEndpoints } from '../specialization.api.endpoints';

vi.mock('@/stores/user', () => ({
  useUserStore: () => ({ user: { type: 2 } }),
}));

describe('SpecializationApiEndpoints', () => {
  it('uses organization specialization endpoints', () => {
    const endpoints = new SpecializationApiEndpoints();
    expect(endpoints.index).toContain('organization/fetch_specializations');
    expect(endpoints.store).toContain('organization/store_specialization');
    expect(endpoints.delete).toContain('organization/delete_specialization');
  });
});
