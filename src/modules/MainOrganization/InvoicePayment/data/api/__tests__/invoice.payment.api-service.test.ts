import { describe, expect, it } from 'vitest';
import InvoicePaymentApiService from '../invoice.payment.api-service';

describe('InvoicePaymentApiService', () => {
  it('returns the same singleton instance', () => {
    expect(InvoicePaymentApiService.getInstance()).toBe(InvoicePaymentApiService.getInstance());
  });

  it('maps base API actions to invoice payment endpoints', () => {
    const service = InvoicePaymentApiService.getInstance() as unknown as {
      endpoints: Record<string, string>;
    };

    expect(service.endpoints.index).toContain('mainportal/fetch_invoice_payments');
    expect(service.endpoints.create).toContain('mainportal/store_invoice_payment');
    expect(service.endpoints.update).toContain('mainportal/update_invoice_payment');
    expect(service.endpoints.delete).toContain('mainportal/delete_invoice_payment');
  });
});
