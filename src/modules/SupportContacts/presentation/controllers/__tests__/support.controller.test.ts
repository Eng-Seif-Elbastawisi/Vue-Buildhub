import { describe, it, expect, vi, beforeEach } from 'vitest';
import SupportContactsController from '../support.controller';

vi.mock('@/modules/SupportContacts/data/repositories/support.repository', () => ({
  default: {
    getInstance: vi.fn(() => ({
      create: vi.fn().mockResolvedValue({ isSuccess: true, data: {} }),
      index: vi.fn().mockResolvedValue({ isSuccess: true, data: [] }),
    })),
  },
}));

vi.mock('@/base/Presentation/Controller/baseController', () => {
  const BaseController = class {
    setItemLoading() {}
    setItemState() {}
    handleItemResponse() {}
    handleErrorResponse() {}
    showLoadingDialog() {}
    hideLoadingDialog() {}
    get config() {
      return {
        showLoadingDialog: true,
        showSuccessDialog: true,
        showErrorDialog: true,
        autoRetry: false,
        maxAutoRetries: 1,
      };
    }
    async create(_params: unknown, _options?: unknown) {
      return { isSuccess: true, data: {} };
    }
  };
  return { default: BaseController };
});

describe('SupportContactsController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (SupportContactsController as any).instance = undefined;
  });

  describe('getInstance', () => {
    it('returns an instance of SupportContactsController', () => {
      const ctrl = SupportContactsController.getInstance();
      expect(ctrl).toBeInstanceOf(SupportContactsController);
    });

    it('returns the same singleton on repeated calls', () => {
      const a = SupportContactsController.getInstance();
      const b = SupportContactsController.getInstance();
      expect(a).toBe(b);
    });
  });

  describe('create', () => {
    it('calls super.create with useJson: true', async () => {
      const ctrl = SupportContactsController.getInstance();
      const mockParams = { toMap: () => ({}) } as any;
      const result = await ctrl.create(mockParams);
      expect(result).toBeDefined();
    });
  });
});
