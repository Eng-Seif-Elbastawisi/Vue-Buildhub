import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginController from '@/modules/MainOrganization/auth_organization/presentation/controllers/login.controller';
import { i18n } from '@/locales/i18n';

// ── Hoisted mocks (must be declared before vi.mock factories run) ─────────────
const { mockPush, mockLogin, mockHandleItemResponse } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockLogin: vi.fn(),
  mockHandleItemResponse: vi.fn(),
}));
const mockSetUser = vi.hoisted(() => vi.fn());

// ── Pinia ────────────────────────────────────────────────────────────────────
vi.mock('@/stores/user', () => ({
  useUserStore: () => ({
    setUser: mockSetUser,
    isAuth: false,
  }),
}));

// ── Router ───────────────────────────────────────────────────────────────────
vi.mock('@/router', () => ({
  default: {
    push: mockPush,
    currentRoute: {
      value: {
        params: { country_code: 'eg' },
      },
    },
  },
}));

// ── Repository ───────────────────────────────────────────────────────────────
vi.mock('@/modules/MainOrganization/auth_organization/data/repositories/login.repository', () => ({
  default: {
    getInstance: () => ({ login: mockLogin }),
  },
}));

// ── BaseController dialogs ────────────────────────────────────────────────────
vi.mock('@/base/Presentation/Controller/baseController', () => {
  const BaseController = class {
    setItemLoading() {}
    setItemState() {}
    handleItemResponse(...args: unknown[]) {
      mockHandleItemResponse(...args);
    }
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

    it('should store the logged in user after successful login', async () => {
      const mockParams = { toMap: () => ({}) } as any;
      const successResponse = { data: { id: 1 }, isSuccess: true };
      mockLogin.mockResolvedValue(successResponse);

      await LoginController.getInstance().login(mockParams);

      expect(mockSetUser).toHaveBeenCalledWith(successResponse.data);
    });

    it('uses the selected language for the success message', async () => {
      const originalLocale = i18n.global.locale;
      i18n.global.locale = 'ar';
      const successResponse = { data: { id: 1 }, isSuccess: true };
      mockLogin.mockResolvedValue(successResponse);

      try {
        await LoginController.getInstance().login({ toMap: () => ({}) } as any);

        expect(mockHandleItemResponse).toHaveBeenCalledWith(
          successResponse,
          'تم تسجيل الدخول بنجاح',
        );
      } finally {
        i18n.global.locale = originalLocale;
      }
    });

    it('should return a DataFailed response when repository throws', async () => {
      const mockParams = { toMap: () => ({}) } as any;
      mockLogin.mockRejectedValue(new Error('Network error'));

      const result = await LoginController.getInstance().login(mockParams);

      expect(result).toBeDefined();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
