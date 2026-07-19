import { describe, expect, it } from 'vitest';
import {
  InvoiceTypeEnum,
  type InvoiceTypeEnum as InvoiceType,
} from '../../constant/invoice.type.enum';
import AddInvoiceParams from '../add.invoice.params';

describe('AddInvoiceParams', () => {
  it('maps and validates a single invoice payload', () => {
    const params = new AddInvoiceParams({
      type: InvoiceTypeEnum.SINGLE,
      project_id: 10,
      invoice_number: 'INV-2026-0001',
      invoice_date: '2026-07-05',
      invoice_amount: 15000,
      notes: 'First design invoice',
    });

    expect(params.toMap()).toEqual({
      invoice_type: InvoiceTypeEnum.SINGLE,
      project_id: 10,
      invoice_date: '2026-07-05',
      invoice_amount: 15000,
      notes: 'First design invoice',
    });
    expect(params.validate().isValid).toBe(true);
  });

  it('maps and validates a group invoice payload with multiple invoice ids', () => {
    const params = new AddInvoiceParams({
      type: InvoiceTypeEnum.GROUP,
      project_id: 10,
      title: 'Design invoices group',
      invoice_ids: [1, 2],
    });

    expect(params.toMap()).toEqual({
      invoice_type: InvoiceTypeEnum.GROUP,
      project_id: 10,
      title: 'Design invoices group',
      invoice_ids: [1, 2],
    });
    expect(params.validate().isValid).toBe(true);
  });

  it.each([
    [
      'single invoice fields',
      InvoiceTypeEnum.SINGLE,
      undefined,
      ['invoice_date', 'invoice_amount'],
    ],
    ['group invoice details and selection', InvoiceTypeEnum.GROUP, [], ['title', 'invoice_ids']],
  ])('requires %s for the selected type', (_scenario, type, invoiceIds, expectedFields) => {
    const params = new AddInvoiceParams({
      type,
      project_id: 10,
      invoice_ids: invoiceIds,
    });

    expect(params.validate().errors.map((error) => error.field)).toEqual(expectedFields);
  });

  it('rejects an unsupported invoice type before sending the request', () => {
    const params = new AddInvoiceParams({
      type: 3 as InvoiceType,
      project_id: 10,
    });

    expect(params.validate().errors.map((error) => error.field)).toContain('type');
  });
});
