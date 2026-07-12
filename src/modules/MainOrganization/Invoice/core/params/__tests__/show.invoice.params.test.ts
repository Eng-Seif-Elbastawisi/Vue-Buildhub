import { describe, expect, it } from 'vitest';
import ShowInvoiceParams from '../show.invoice.params';

describe('ShowInvoiceParams', () => {
  it('maps invoice id for show requests', () => {
    expect(new ShowInvoiceParams({ invoice_id: 7 }).toMap()).toEqual({ invoice_id: 7 });
  });
});
