import { describe, expect, it, vi } from 'vitest';

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
});
