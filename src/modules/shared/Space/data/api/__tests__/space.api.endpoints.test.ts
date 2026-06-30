import { describe, expect, it, vi } from 'vitest';
import { SpaceApiEndpoints } from '../space.api.endpoints';

vi.mock('@/stores/user', () => ({
  useUserStore: () => ({ user: { type: 2 } }),
}));

describe('SpaceApiEndpoints', () => {
  it('uses organization space endpoints', () => {
    const endpoints = new SpaceApiEndpoints();
    expect(endpoints.index).toContain('organization/fetch_spaces');
    expect(endpoints.store).toContain('organization/store_space');
    expect(endpoints.delete).toContain('organization/delete_space');
  });
});
