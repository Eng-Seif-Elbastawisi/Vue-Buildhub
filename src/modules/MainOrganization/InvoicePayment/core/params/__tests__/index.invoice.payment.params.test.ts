import { describe, expect, it } from 'vitest';
import IndexInvoicePaymentParams from '../index.invoice.payment.params';

describe('IndexInvoicePaymentParams', () => {
  it('adds invoice_id filter when provided', () => {
    expect(new IndexInvoicePaymentParams('INV', 2, 20, 1, 4).toMap()).toMatchObject({
      word: 'INV',
      page: 2,
      per_page: 20,
      with_pagination: 1,
      invoice_id: 4,
    });
  });
});
