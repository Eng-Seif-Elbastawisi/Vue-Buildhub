import { describe, expect, it } from 'vitest';
import { InvoiceStatusEnum } from '../../constant/invoice.status.enum';
import IndexInvoiceParams from '../index.invoice.params';

describe('IndexInvoiceParams', () => {
  it('adds project_id and status filters when provided', () => {
    expect(
      new IndexInvoiceParams('INV', 2, 20, 1, 10, InvoiceStatusEnum.PAID).toMap(),
    ).toMatchObject({
      word: 'INV',
      page: 2,
      per_page: 20,
      with_pagination: 1,
      project_id: 10,
      invoice_status: InvoiceStatusEnum.PAID,
    });
  });
});
