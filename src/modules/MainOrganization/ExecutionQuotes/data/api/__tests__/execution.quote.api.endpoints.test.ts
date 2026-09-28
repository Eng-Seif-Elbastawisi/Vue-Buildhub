import { describe, expect, it, vi } from 'vitest';
import { ExecutionQuoteApiEndpoints } from '../execution.quote.api.endpoints';

vi.mock('@/stores/user', () => ({
  useUserStore: () => ({ user: { type: 2 } }),
}));

describe('ExecutionQuoteApiEndpoints', () => {
  it('uses the organization execution quote endpoints', () => {
    const endpoints = new ExecutionQuoteApiEndpoints();

    expect(endpoints.store).toContain('organization/store_quote');
    expect(endpoints.storeDetails).toContain('organization/store_quote_stage');
    expect(endpoints.setStagePricing).toContain('organization/set_quote_stage_client_price');
    expect(endpoints.editQuoteItem).toContain('organization/update_quote_stage_item');
    expect(endpoints.deleteQuoteItem).toContain('organization/delete_quote_stage_item');
    expect(endpoints.setSupervisionPricing).toContain(
      'organization/set_quote_supervision_percentage',
    );
  });
});
