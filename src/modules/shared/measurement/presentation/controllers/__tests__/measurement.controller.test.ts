import { describe, expect, it } from 'vitest';
import MeasurementController from '../measurement.controller';

describe('MeasurementController', () => {
  it('returns the same singleton instance', () => {
    expect(MeasurementController.getInstance()).toBe(MeasurementController.getInstance());
  });

  it('uses non-blocking controller feedback settings', () => {
    const controller = MeasurementController.getInstance() as unknown as {
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
