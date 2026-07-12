import { describe, expect, it } from 'vitest';
import AddInvoiceParams from '../add.invoice.params';

describe('AddInvoiceParams', () => {
  it('maps store invoice payload', () => {
    const params = new AddInvoiceParams({
      project_id: 10,
      invoice_number: 'INV-2026-0001',
      invoice_date: '2026-07-05',
      invoice_amount: 15000,
      notes: 'First design invoice',
    });

    expect(params.toMap()).toEqual({
      project_id: 10,
      invoice_number: 'INV-2026-0001',
      invoice_date: '2026-07-05',
      invoice_amount: 15000,
      notes: 'First design invoice',
    });
  });
});
