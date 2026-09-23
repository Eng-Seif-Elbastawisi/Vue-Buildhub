import { describe, expect, it, vi } from 'vitest';
import { ExecutionQuoteApiEndpoints } from '../execution.quote.api.endpoints';

vi.mock('@/stores/user', () => ({
  useUserStore: () => ({ user: { type: 2 } }),
}));

describe('ExecutionQuoteApiEndpoints', () => {
  it('uses the organization execution quote endpoints', () => {
    const endpoints = new ExecutionQuoteApiEndpoints();

    expect(endpoints.store).toContain('organization/store_quote');
    expect(endpoints.storeDetails).toContain('organization/store_execution_quote_details');
  });
});
