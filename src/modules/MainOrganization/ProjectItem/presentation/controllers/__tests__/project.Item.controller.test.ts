import { describe, expect, it, vi } from 'vitest';
import ShowProjectItemParams from '../../../core/params/show.project.Item.params';

vi.mock('@/stores/formsStore', () => ({
  useFormsStore: () => ({ clearFormData: vi.fn() }),
}));

vi.mock('@/router', () => ({
  default: { push: vi.fn() },
}));

const { default: ProjectItemController } = await import('../project.Item.controller');

describe('ProjectItemController', () => {
  it('returns the same singleton instance', () => {
    expect(ProjectItemController.getInstance()).toBe(ProjectItemController.getInstance());
  });

  it('uses non-blocking controller feedback settings', () => {
    const controller = ProjectItemController.getInstance() as unknown as {
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
    expect(new ShowProjectItemParams({ item_id: 3, allLocales: true }).allLocales).toBe(true);
  });
});
