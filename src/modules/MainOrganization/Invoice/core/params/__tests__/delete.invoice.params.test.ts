import { describe, expect, it } from 'vitest';
import DeleteInvoiceParams from '../delete.invoice.params';

describe('DeleteInvoiceParams', () => {
  it('maps invoice id for delete requests', () => {
    expect(new DeleteInvoiceParams({ invoice_id: 7 }).toMap()).toEqual({ invoice_id: 7 });
  });
});
