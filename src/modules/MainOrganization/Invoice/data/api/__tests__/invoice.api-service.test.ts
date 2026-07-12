import { describe, expect, it } from 'vitest';
import InvoiceApiService from '../invoice.api-service';

describe('InvoiceApiService', () => {
  it('returns the same singleton instance', () => {
    expect(InvoiceApiService.getInstance()).toBe(InvoiceApiService.getInstance());
  });

  it('maps base API actions to invoice endpoints', () => {
    const service = InvoiceApiService.getInstance() as unknown as {
      endpoints: Record<string, string>;
    };

    expect(service.endpoints.index).toContain('mainportal/fetch_invoices');
    expect(service.endpoints.create).toContain('mainportal/store_invoice');
    expect(service.endpoints.update).toContain('mainportal/update_invoice');
    expect(service.endpoints.delete).toContain('mainportal/delete_invoice');
  });
});
