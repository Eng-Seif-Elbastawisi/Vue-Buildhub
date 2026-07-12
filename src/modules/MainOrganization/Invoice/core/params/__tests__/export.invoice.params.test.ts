import { describe, expect, it } from 'vitest';
import ExportInvoiceParams from '../export.invoice.params';

describe('ExportInvoiceParams', () => {
  it('maps export invoice payload', () => {
    expect(new ExportInvoiceParams({ invoice_id: 7 }).toMap()).toEqual({
      invoice_id: 7,
    });
  });
});
