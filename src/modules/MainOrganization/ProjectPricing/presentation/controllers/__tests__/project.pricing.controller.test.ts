import { describe, expect, it, vi } from 'vitest';
import ShowProjectPricingParams from '../../../core/params/show.project.pricing.params';

vi.mock('@/stores/formsStore', () => ({
  useFormsStore: () => ({ clearFormData: vi.fn() }),
}));

vi.mock('@/router', () => ({
  default: { push: vi.fn() },
}));

const { default: ProjectPricingController } = await import('../project.pricing.controller');

describe('ProjectPricingController', () => {
  it('returns the same singleton instance', () => {
    expect(ProjectPricingController.getInstance()).toBe(ProjectPricingController.getInstance());
  });

  it('uses non-blocking controller feedback settings', () => {
    const controller = ProjectPricingController.getInstance() as unknown as {
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

  it('keeps allLocales flag available for fetchOne headers', () => {
    expect(
      new ShowProjectPricingParams({ project_pricing_id: 3, allLocales: true }).allLocales,
    ).toBe(true);
  });
});
