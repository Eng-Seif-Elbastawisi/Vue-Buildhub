import { describe, expect, it, vi } from 'vitest';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import InvoiceModel from '../../../core/models/invoice.model';

vi.mock('@/stores/formsStore', () => ({
  useFormsStore: () => ({ clearFormData: vi.fn() }),
}));

vi.mock('@/router', () => ({
  default: { push: vi.fn() },
}));

const { default: InvoiceController } = await import('../invoice.controller');

describe('InvoiceController', () => {
  it('returns the same singleton instance', () => {
    expect(InvoiceController.getInstance()).toBe(InvoiceController.getInstance());
  });

  it('uses non-blocking controller feedback settings', () => {
    const controller = InvoiceController.getInstance() as unknown as {
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

  it('maps invoices to select options using invoice number', () => {
    const controller = InvoiceController.getInstance() as unknown as {
      toTitleInterface(invoice: InvoiceModel): {
        id: string | number;
        title: string;
        subtitle: string;
      };
    };

    const option = controller.toTitleInterface(InvoiceModel.example);

    expect(option.id).toBe(1);
    expect(option.title).toBe('INV-2026-0001');
    expect(option.subtitle).toBe('2026-07-05');
  });

  it('fetches invoice details by invoice id', async () => {
    const result = await InvoiceController.getInstance().fetchInvoiceById(1, {
      useStaticData: true,
    });

    expect(result).toBeInstanceOf(DataSuccess);
    expect(result.data?.invoice_number).toBe('INV-2026-0001');
  });

  it('exports invoice by invoice id', async () => {
    const result = await InvoiceController.getInstance().exportInvoice(7, {
      useStaticData: true,
    });

    expect(result).toBeInstanceOf(DataSuccess);
    expect(result.data).toEqual({ invoice_id: 7 });
  });
});
