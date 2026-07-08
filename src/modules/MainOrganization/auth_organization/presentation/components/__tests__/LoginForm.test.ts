import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import LoginForm from '@/modules/MainOrganization/auth_organization/presentation/components/LoginForm.vue';
import LoginController from '@/modules/MainOrganization/auth_organization/presentation/controllers/login.controller';
import LoginParams from '@/modules/MainOrganization/auth_organization/core/params/login.params';

vi.mock(
  '@/modules/MainOrganization/auth_organization/presentation/controllers/login.controller',
  () => {
    return {
      default: {
        getInstance: vi.fn(),
      },
    };
  },
);

const mockPush = vi.fn();

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock('@/stores/user', () => ({
  useUserStore: () => ({
    user: { type: 2 },
  }),
}));

vi.mock('vue-i18n', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-i18n')>();

  return {
    ...actual,
    useI18n: () => ({
      locale: { value: 'en' },
      t: (key: string, params?: Record<string, string>) =>
        key === 'field_help.show_for' ? `Show help for ${params?.field}` : key,
    }),
  };
});

describe('LoginForm.vue', () => {
  let mockLogin: any;

  beforeEach(() => {
    mockLogin = vi.fn();
    (LoginController.getInstance as any).mockReturnValue({
      login: mockLogin,
    });
  });

  const mountOptions = {
    global: {
      mocks: {
        $t: (msg: string) => msg,
      },
    },
  };

  it('renders login form properly', () => {
    const wrapper = mount(LoginForm, mountOptions);
    expect(wrapper.find('form.login-form').exists()).toBe(true);
    expect(wrapper.find('input#email').exists()).toBe(true);
    expect(wrapper.find('input#password').exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').text()).toBe('Log In');
  });

  it('calls login controller with correct params on submit', async () => {
    const wrapper = mount(LoginForm, mountOptions);

    const emailInput = wrapper.find('input#email');
    const passwordInput = wrapper.find('input#password');

    await emailInput.setValue('test@example.com');
    await passwordInput.setValue('password123');

    await wrapper.find('form.login-form').trigger('submit.prevent');

    expect(mockLogin).toHaveBeenCalledTimes(1);
    const expectedParams = new LoginParams('test@example.com', 'password123');
    expect(mockLogin).toHaveBeenCalledWith(expectedParams);
    expect(mockPush).toHaveBeenCalledWith({ name: 'Employee' });
  });
});
