import { describe, expect, it } from 'vitest';
import OrganizationController from '../organization.toggl.controller';

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
});
