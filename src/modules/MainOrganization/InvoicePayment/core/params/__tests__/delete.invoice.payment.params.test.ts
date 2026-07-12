import { describe, expect, it } from 'vitest';
import DeleteInvoicePaymentParams from '../delete.invoice.payment.params';

describe('DeleteInvoicePaymentParams', () => {
  it('maps invoice payment id for delete requests', () => {
    expect(new DeleteInvoicePaymentParams({ invoice_payment_id: 7 }).toMap()).toEqual({
      invoice_payment_id: 7,
    });
  });
});
