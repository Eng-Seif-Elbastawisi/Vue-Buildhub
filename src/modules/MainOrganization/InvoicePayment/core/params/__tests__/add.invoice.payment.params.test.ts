import { describe, expect, it } from 'vitest';
import AddInvoicePaymentParams from '../add.invoice.payment.params';

describe('AddInvoicePaymentParams', () => {
  it('maps store invoice payment payload', () => {
    expect(
      new AddInvoicePaymentParams({
        invoice_id: 4,
        payment_amount: 1000,
        payment_date: '2026-07-05',
        payment_method: 1,
        notes: 'First payment',
      }).toMap(),
    ).toEqual({
      invoice_id: 4,
      payment_amount: 1000,
      payment_date: '2026-07-05',
      payment_method: 1,
      notes: 'First payment',
    });
  });
});
