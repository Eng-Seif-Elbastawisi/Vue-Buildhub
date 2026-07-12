import { describe, expect, it } from 'vitest';
import InvoicePaymentModel from '../../../core/models/invoice.payment.model';
import InvoicePaymentRepository from '../invoice.payment.repository';

const paymentJson = {
  id: 7,
  invoice_id: 4,
  payment_amount: 1000,
  payment_date: '2026-07-05',
  payment_method: 1,
  notes: 'First payment',
};

describe('InvoicePaymentRepository', () => {
  it('returns the same singleton instance', () => {
    expect(InvoicePaymentRepository.getInstance()).toBe(InvoicePaymentRepository.getInstance());
  });

  it('parses invoice payment and list responses', () => {
    const repository = InvoicePaymentRepository.getInstance() as unknown as {
      parseItem(data: Record<string, unknown>): InvoicePaymentModel;
      parseList(data: unknown): InvoicePaymentModel[];
      config: { hasPagination: boolean; dataKey: string; paginationKey: string };
    };

    expect(repository.config).toEqual({
      hasPagination: true,
      dataKey: 'data',
      paginationKey: 'meta',
    });
    expect(repository.parseItem(paymentJson)).toBeInstanceOf(InvoicePaymentModel);
    expect(repository.parseList([paymentJson])).toEqual([expect.any(InvoicePaymentModel)]);
    expect(repository.parseList({})).toEqual([]);
  });
});
