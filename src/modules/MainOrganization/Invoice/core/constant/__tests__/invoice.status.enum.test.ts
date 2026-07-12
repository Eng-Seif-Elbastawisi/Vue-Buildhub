import { describe, expect, it } from 'vitest';
import { InvoiceStatusEnum, InvoiceStatusLabelKeys } from '../invoice.status.enum';

describe('InvoiceStatusEnum', () => {
  it('exposes stable invoice status identifiers and label keys', () => {
    expect(InvoiceStatusEnum).toEqual({
      UNPAID: 1,
      PARTIAL: 2,
      PAID: 3,
      EXTRA_PAID: 4,
    });
    expect(InvoiceStatusLabelKeys[InvoiceStatusEnum.PARTIAL]).toBe('invoice_show.status_partial');
  });
});
