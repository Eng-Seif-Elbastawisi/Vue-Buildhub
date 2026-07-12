import { describe, expect, it } from 'vitest';
import { InvoiceApiEndpoints } from '../invoice.api.endpoints';

describe('InvoiceApiEndpoints', () => {
  it('uses dashboard invoice endpoints', () => {
    const endpoints = new InvoiceApiEndpoints();

    expect(endpoints.index).toContain('mainportal/fetch_invoices');
    expect(endpoints.show).toContain('mainportal/show_invoice');
    expect(endpoints.store).toContain('mainportal/store_invoice');
    expect(endpoints.update).toContain('mainportal/update_invoice');
    expect(endpoints.delete).toContain('mainportal/delete_invoice');
  });
});
