import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AuthShell from '../AuthShell.vue';

const mockLocale = vi.hoisted(() => ({ value: 'ar' }));

vi.mock('vue-i18n', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-i18n')>();

  return {
    ...actual,
    useI18n: () => ({ locale: mockLocale }),
  };
});

const mountOptions = {
  global: {
    mocks: {
      $t: (msg: string) => msg,
    },
  },
  slots: {
    default: '<form class="login-form"><button type="submit">Log In</button></form>',
  },
};

describe('AuthShell.vue', () => {
  beforeEach(() => {
    mockLocale.value = 'ar';
  });

  it('renders organization login content with the slotted form', () => {
    const wrapper = mount(AuthShell, {
      ...mountOptions,
      props: { mode: 'organization' },
    });

    expect(wrapper.classes()).toContain('auth-workspace--organization');
    expect(wrapper.attributes('dir')).toBe('rtl');
    expect(wrapper.text()).toContain('auth_organization_headline_first_accent');
    expect(wrapper.text()).toContain('auth_organization_headline_second_accent');
    expect(wrapper.text()).toContain('auth_organization_description');
    expect(wrapper.get('h1').attributes('id')).toBe('organization-login-title');
    expect(wrapper.get('img').attributes('alt')).toBe('buildhub_logo');
    expect(wrapper.find('form.login-form').exists()).toBe(true);
  });

  it('renders admin login content', () => {
    const wrapper = mount(AuthShell, {
      ...mountOptions,
      props: { mode: 'admin' },
    });

    expect(wrapper.classes()).toContain('auth-workspace--admin');
    expect(wrapper.attributes('dir')).toBe('rtl');
    expect(wrapper.text()).toContain('auth_admin_headline_first_accent');
    expect(wrapper.text()).toContain('auth_admin_headline_second_accent');
    expect(wrapper.get('h1').attributes('id')).toBe('admin-login-title');
    expect(wrapper.find('form.login-form').exists()).toBe(true);
  });

  it('uses LTR direction when English is selected', () => {
    mockLocale.value = 'en';

    const wrapper = mount(AuthShell, {
      ...mountOptions,
      props: { mode: 'organization' },
    });

    expect(wrapper.attributes('dir')).toBe('ltr');
  });
});
