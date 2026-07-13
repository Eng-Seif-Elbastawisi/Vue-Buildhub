import { describe, expect, it, vi } from 'vitest';
import TermApiService from '../term.api-service';

vi.mock('@/stores/user', () => ({
  useUserStore: () => ({ user: { type: 2 } }),
}));

describe('TermApiService', () => {
  it('returns the same singleton', () => {
    expect(TermApiService.getInstance()).toBe(TermApiService.getInstance());
  });
});
