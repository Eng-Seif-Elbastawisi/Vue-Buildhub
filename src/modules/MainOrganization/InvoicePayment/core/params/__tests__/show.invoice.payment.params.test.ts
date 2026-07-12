import { describe, expect, it } from 'vitest';
import ShowInvoicePaymentParams from '../show.invoice.payment.params';

describe('ShowInvoicePaymentParams', () => {
  it('maps invoice payment id for show requests', () => {
    expect(new ShowInvoicePaymentParams({ invoice_payment_id: 7 }).toMap()).toEqual({
      invoice_payment_id: 7,
    });
  });
});
