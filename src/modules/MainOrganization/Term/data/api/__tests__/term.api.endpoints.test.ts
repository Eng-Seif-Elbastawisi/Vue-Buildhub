import { describe, expect, it, vi } from 'vitest';
import { TermApiEndpoints } from '../term.api.endpoints';

vi.mock('@/stores/user', () => ({
  useUserStore: () => ({ user: { type: 2 } }),
}));

describe('TermApiEndpoints', () => {
  it('uses organization term endpoints', () => {
    const endpoints = new TermApiEndpoints();
    expect(endpoints.index).toContain('organization/fetch_terms');
    expect(endpoints.store).toContain('organization/store_term');
    expect(endpoints.delete).toContain('organization/delete_term');
  });
});
