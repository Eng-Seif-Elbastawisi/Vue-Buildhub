import { describe, expect, it } from 'vitest';
import InvoicePaymentModel from '../invoice.payment.model';

describe('InvoicePaymentModel', () => {
  it('maps invoice payment json', () => {
    const model = InvoicePaymentModel.fromJson({
      id: 3,
      invoice_id: 4,
      invoice: { id: 4, invoice_number: 'INV-2026-0001' },
      payment_amount: '1000',
      payment_date: '2026-07-05',
      payment_method: 1,
      notes: 'First payment',
    });

    expect(model.id).toBe(3);
    expect(model.invoice_id).toBe(4);
    expect(model.invoice?.invoice_number).toBe('INV-2026-0001');
    expect(model.payment_amount).toBe(1000);
    expect(model.payment_method).toBe(1);
    expect(model.notes).toBe('First payment');
  });

  it('throws for invalid json', () => {
    expect(() => InvoicePaymentModel.fromJson(null as unknown as Record<string, unknown>)).toThrow();
  });
});
