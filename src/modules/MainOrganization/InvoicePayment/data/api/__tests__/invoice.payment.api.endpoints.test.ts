import { describe, expect, it } from 'vitest';
import { InvoicePaymentApiEndpoints } from '../invoice.payment.api.endpoints';

describe('InvoicePaymentApiEndpoints', () => {
  it('uses dashboard invoice payment endpoints', () => {
    const endpoints = new InvoicePaymentApiEndpoints();

    expect(endpoints.index).toContain('mainportal/fetch_invoice_payments');
    expect(endpoints.show).toContain('mainportal/show_invoice_payment');
    expect(endpoints.store).toContain('mainportal/store_invoice_payment');
    expect(endpoints.update).toContain('mainportal/update_invoice_payment');
    expect(endpoints.delete).toContain('mainportal/delete_invoice_payment');
  });
});
