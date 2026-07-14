import { describe, expect, it } from 'vitest';
import EditInvoicePaymentParams from '../edit.invoice.payment.params';

describe('EditInvoicePaymentParams', () => {
  it('includes invoice payment id with editable fields', () => {
    const params = new EditInvoicePaymentParams({
      invoice_payment_id: 7,
      invoice_id: 4,
      payment_amount: 1000,
      payment_date: '2026-07-05',
      payment_method: 1,
      notes: 'Updated payment',
    });

    expect(params.toMap()).toEqual({
      invoice_payment_id: 7,
      invoice_id: 4,
      payment_amount: 1000,
      payment_date: '2026-07-05',
      payment_method: 1,
      notes: 'Updated payment',
    });
    expect(params.validate().isValid).toBe(true);
  });

  it('requires payment method selection', () => {
    const params = new EditInvoicePaymentParams({
      invoice_payment_id: 7,
      invoice_id: 4,
      payment_amount: 1000,
      payment_date: '2026-07-05',
    });

    expect(params.validate()).toMatchObject({
      isValid: false,
      errors: [{ field: 'payment_method' }],
    });
  });
});
