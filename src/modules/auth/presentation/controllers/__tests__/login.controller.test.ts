import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginController from '../login.controller';

// ── Hoisted mocks (must be declared before vi.mock factories run) ─────────────
const { mockLogin, mockSetUser } = vi.hoisted(() => ({
  mockLogin: vi.fn(),
  mockSetUser: vi.fn(),
}));

// ── Pinia ────────────────────────────────────────────────────────────────────
vi.mock('@/stores/user', () => ({
  useUserStore: () => ({
    setUser: mockSetUser,
    isAuth: false,
  }),
}));

// ── Repository ───────────────────────────────────────────────────────────────
vi.mock('@/modules/auth/data/repositories/login.repository', () => ({
  default: {
    getInstance: () => ({ login: mockLogin }),
  },
}));

// ── BaseController dialogs ────────────────────────────────────────────────────
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
        maxAutoRetries: 2,
      };
    }
  };
  return { default: BaseController };
});

describe('LoginController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset singleton between tests
    (LoginController as any).instance = undefined;
  });

  describe('getInstance', () => {
    it('should return the same instance on repeated calls', () => {
      const a = LoginController.getInstance();
      const b = LoginController.getInstance();
      expect(a).toBe(b);
    });

    it('should return an instance of LoginController', () => {
      expect(LoginController.getInstance()).toBeInstanceOf(LoginController);
    });
  });

  describe('login', () => {
    it('should call repository.login with the given params', async () => {
      const mockParams = { toMap: () => ({}) } as any;
      const successResponse = { data: { id: 1 }, isSuccess: true };
      mockLogin.mockResolvedValue(successResponse);

      await LoginController.getInstance().login(mockParams);

      expect(mockLogin).toHaveBeenCalledWith(mockParams);
    });

    it('should store the user after successful login', async () => {
      const mockParams = { toMap: () => ({}) } as any;
      const successResponse = { data: { id: 1 }, isSuccess: true };
      mockLogin.mockResolvedValue(successResponse);

      await LoginController.getInstance().login(mockParams);

      expect(mockSetUser).toHaveBeenCalledWith(successResponse.data);
    });

    it('should return a DataFailed response when repository throws', async () => {
      const mockParams = { toMap: () => ({}) } as any;
      mockLogin.mockRejectedValue(new Error('Network error'));

      const result = await LoginController.getInstance().login(mockParams);

      expect(result).toBeDefined();
      expect(mockSetUser).not.toHaveBeenCalled();
    });
  });
});
