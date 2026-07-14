import { describe, expect, it } from 'vitest';
import AddInvoicePaymentParams from '../add.invoice.payment.params';

describe('AddInvoicePaymentParams', () => {
  it('maps store invoice payment payload', () => {
    const params = new AddInvoicePaymentParams({
      invoice_id: 4,
      payment_amount: 1000,
      payment_date: '2026-07-05',
      payment_method: 1,
      notes: 'First payment',
    });

    expect(params.toMap()).toEqual({
      invoice_id: 4,
      payment_amount: 1000,
      payment_date: '2026-07-05',
      payment_method: 1,
      notes: 'First payment',
    });
    expect(params.validate().isValid).toBe(true);
  });

  it('requires payment method selection', () => {
    const params = new AddInvoicePaymentParams({
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
