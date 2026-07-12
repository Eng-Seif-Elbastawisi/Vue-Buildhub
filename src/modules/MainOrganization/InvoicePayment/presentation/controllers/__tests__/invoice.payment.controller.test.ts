import { describe, expect, it, vi } from 'vitest';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import AddInvoicePaymentParams from '../../../core/params/add.invoice.payment.params';

const push = vi.hoisted(() => vi.fn());

vi.mock('@/stores/formsStore', () => ({
  useFormsStore: () => ({ clearFormData: vi.fn() }),
}));

vi.mock('@/router', () => ({
  default: { push },
}));

const { default: InvoicePaymentController } = await import('../invoice.payment.controller');

describe('InvoicePaymentController', () => {
  it('returns the same singleton instance', () => {
    expect(InvoicePaymentController.getInstance()).toBe(InvoicePaymentController.getInstance());
  });

  it('uses non-blocking controller feedback settings', () => {
    const controller = InvoicePaymentController.getInstance() as unknown as {
      config: {
        showLoadingDialog: boolean;
        showSuccessDialog: boolean;
        showErrorDialog: boolean;
        showErrorTosat: boolean;
        showSuccessTosat: boolean;
        autoRetry: boolean;
        maxAutoRetries: number;
      };
    };

    expect(controller.config).toEqual({
      showLoadingDialog: false,
      showSuccessDialog: false,
      showErrorDialog: false,
      showErrorTosat: true,
      showSuccessTosat: true,
      autoRetry: false,
      maxAutoRetries: 1,
    });
  });

  it('creates invoice payment for show page without redirecting', async () => {
    push.mockClear();

    const result = await InvoicePaymentController.getInstance().createInvoicePayment(
      4,
      new AddInvoicePaymentParams({
        invoice_id: 99,
        payment_amount: 1000,
        payment_date: '2026-07-05',
        payment_method: 1,
        notes: 'First payment',
      }),
      { useStaticData: true },
    );

    expect(result).toBeInstanceOf(DataSuccess);
    expect(push).not.toHaveBeenCalled();
  });

  it('fetches invoice payments by invoice id', async () => {
    const result = await InvoicePaymentController.getInstance().fetchInvoicePayments(4, {
      useStaticData: true,
    });

    expect(result).toBeInstanceOf(DataSuccess);
  });
});
