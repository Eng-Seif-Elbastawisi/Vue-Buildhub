import { describe, expect, it } from 'vitest';
import {
  InvoiceStatusClassNames,
  InvoiceStatusEnum,
  InvoiceStatusLabelKeys,
  normalizeInvoiceStatus,
} from '../invoice.status.enum';

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

  it('normalizes numeric and text status values and exposes badge classes', () => {
    expect(normalizeInvoiceStatus('paid')).toBe(InvoiceStatusEnum.PAID);
    expect(normalizeInvoiceStatus('1')).toBe(InvoiceStatusEnum.UNPAID);
    expect(normalizeInvoiceStatus('extra paid')).toBe(InvoiceStatusEnum.EXTRA_PAID);
    expect(normalizeInvoiceStatus('unknown')).toBeUndefined();
    expect(InvoiceStatusClassNames[InvoiceStatusEnum.PAID]).toBe('is-paid');
    expect(InvoiceStatusClassNames[InvoiceStatusEnum.UNPAID]).toBe('is-unpaid');
  });
});
