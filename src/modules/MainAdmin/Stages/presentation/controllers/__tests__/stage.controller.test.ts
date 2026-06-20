import { describe, expect, it } from 'vitest';
import StageController from '../stage.controller';

describe('StageController', () => {
  it('returns the same singleton instance', () => {
    expect(StageController.getInstance()).toBe(StageController.getInstance());
  });

  it('uses non-blocking controller feedback settings', () => {
    const controller = StageController.getInstance() as unknown as {
      config: {
        showLoadingDialog: boolean;
        showSuccessDialog: boolean;
        showErrorDialog: boolean;
        autoRetry: boolean;
        showErrorTosat: boolean;
        showSuccessTosat: boolean;
        maxAutoRetries: number;
      };
    };

    expect(controller.config).toEqual({
      showLoadingDialog: false,
      showSuccessDialog: false,
      showErrorDialog: false,
      autoRetry: false,
      showErrorTosat: true,
      showSuccessTosat: true,
      maxAutoRetries: 1,
    });
  });
});
