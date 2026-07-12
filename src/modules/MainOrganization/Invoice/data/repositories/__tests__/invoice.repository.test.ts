import { describe, expect, it } from 'vitest';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import InvoiceModel from '../../../core/models/invoice.model';
import InvoiceShowModel from '../../../core/models/invoice.show.model';
import ExportInvoiceParams from '../../../core/params/export.invoice.params';
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
      parseItem(data: Record<string, unknown>): InvoiceShowModel;
      parseList(data: unknown): InvoiceModel[];
      config: { hasPagination: boolean; dataKey: string; paginationKey: string };
    };

    expect(repository.config).toEqual({
      hasPagination: true,
      dataKey: 'data',
      paginationKey: 'meta',
    });
    expect(repository.parseItem(invoiceJson)).toBeInstanceOf(InvoiceShowModel);
    expect(repository.parseList([invoiceJson])).toEqual([expect.any(InvoiceModel)]);
    expect(repository.parseList({})).toEqual([]);
  });

  it('exports invoice with static data', async () => {
    const result = await InvoiceRepository.getInstance().exportInvoice(
      new ExportInvoiceParams({ invoice_id: 7 }),
      { useStaticData: true },
    );

    expect(result).toBeInstanceOf(DataSuccess);
    expect(result.data).toEqual({ invoice_id: 7 });
  });
});
