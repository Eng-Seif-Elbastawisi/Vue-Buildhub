import { describe, expect, it } from 'vitest';
import EditInvoicePaymentParams from '../edit.invoice.payment.params';

describe('EditInvoicePaymentParams', () => {
  it('includes invoice payment id with editable fields', () => {
    expect(
      new EditInvoicePaymentParams({
        invoice_payment_id: 7,
        invoice_id: 4,
        payment_amount: 1000,
        payment_date: '2026-07-05',
        payment_method: 1,
        notes: 'Updated payment',
      }).toMap(),
    ).toEqual({
      invoice_payment_id: 7,
      invoice_id: 4,
      payment_amount: 1000,
      payment_date: '2026-07-05',
      payment_method: 1,
      notes: 'Updated payment',
    });
  });
});
