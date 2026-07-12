import { describe, expect, it } from 'vitest';
import InvoiceModel from '../../../core/models/invoice.model';
import InvoiceRepository from '../invoice.repository';

const invoiceJson = {
  id: 7,
  project_id: 10,
  invoice_number: 'INV-2026-0001',
  invoice_date: '2026-07-05',
  invoice_amount: 15000,
  notes: 'First design invoice',
};

describe('InvoiceRepository', () => {
  it('returns the same singleton instance', () => {
    expect(InvoiceRepository.getInstance()).toBe(InvoiceRepository.getInstance());
  });

  it('parses invoice and list responses', () => {
    const repository = InvoiceRepository.getInstance() as unknown as {
      parseItem(data: Record<string, unknown>): InvoiceModel;
      parseList(data: unknown): InvoiceModel[];
      config: { hasPagination: boolean; dataKey: string; paginationKey: string };
    };

    expect(repository.config).toEqual({
      hasPagination: true,
      dataKey: 'data',
      paginationKey: 'meta',
    });
    expect(repository.parseItem(invoiceJson)).toBeInstanceOf(InvoiceModel);
    expect(repository.parseList([invoiceJson])).toEqual([expect.any(InvoiceModel)]);
    expect(repository.parseList({})).toEqual([]);
  });
});
