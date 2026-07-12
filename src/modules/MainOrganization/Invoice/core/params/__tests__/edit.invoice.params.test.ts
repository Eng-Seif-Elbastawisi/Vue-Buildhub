import { describe, expect, it } from 'vitest';
import EditInvoiceParams from '../edit.invoice.params';

describe('EditInvoiceParams', () => {
  it('includes invoice id with editable invoice fields', () => {
    expect(
      new EditInvoiceParams({
        invoice_id: 7,
        project_id: 10,
        invoice_number: 'INV-2026-0001',
        invoice_date: '2026-07-05',
        invoice_amount: 15000,
        notes: 'Updated note',
      }).toMap(),
    ).toEqual({
      invoice_id: 7,
      project_id: 10,
      invoice_number: 'INV-2026-0001',
      invoice_date: '2026-07-05',
      invoice_amount: 15000,
      notes: 'Updated note',
    });
  });
});
