import { describe, expect, it, vi } from 'vitest';
import ShowOrganizationParams from '../../../core/params/show.organization.params';

vi.mock('@/stores/user', () => ({
  useUserStore: () => ({ user: { isMaster: true } }),
}));

vi.mock('@/stores/formsStore', () => ({
  useFormsStore: () => ({ clearFormData: vi.fn() }),
}));

vi.mock('@/router', () => ({
  default: { push: vi.fn() },
}));

const { default: OrganizationController } = await import('../organization.controller');

describe('OrganizationController', () => {
  it('returns the same singleton instance', () => {
    expect(OrganizationController.getInstance()).toBe(OrganizationController.getInstance());
  });

  it('uses non-blocking controller feedback settings', () => {
    const controller = OrganizationController.getInstance() as unknown as {
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
    const params = new ShowOrganizationParams({ organization_id: 3, allLocales: true });
    expect(params.allLocales).toBe(true);
  });
});
