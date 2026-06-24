import { describe, expect, it, vi } from 'vitest';
import SpecializationApiService from '../specialization.api-service';

vi.mock('@/stores/user', () => ({
  useUserStore: () => ({ user: { type: 2 } }),
}));

describe('SpecializationApiService', () => {
  it('returns the same singleton', () => {
    expect(SpecializationApiService.getInstance()).toBe(SpecializationApiService.getInstance());
  });
});
