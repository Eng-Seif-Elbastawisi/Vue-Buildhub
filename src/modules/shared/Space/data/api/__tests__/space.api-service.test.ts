import { describe, expect, it, vi } from 'vitest';
import SpaceApiService from '../space.api-service';

vi.mock('@/stores/user', () => ({
  useUserStore: () => ({ user: { type: 2 } }),
}));

describe('SpaceApiService', () => {
  it('returns the same singleton', () => {
    expect(SpaceApiService.getInstance()).toBe(SpaceApiService.getInstance());
  });
});
