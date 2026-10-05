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

    expect(wrapper.classes()).toContain('auth-shell--organization');
    expect(wrapper.attributes('dir')).toBe('rtl');
    expect(wrapper.text()).toContain('auth_organization_headline_first_accent');
    expect(wrapper.text()).toContain('auth_organization_headline_second_accent');
    expect(wrapper.text()).toContain('auth_organization_description');
    expect(wrapper.find('.organization-construction').exists()).toBe(true);
    expect(wrapper.find('.admin-estimation').exists()).toBe(false);
    expect(wrapper.find('form.login-form').exists()).toBe(true);
  });

  it('renders admin login content', () => {
    const wrapper = mount(AuthShell, {
      ...mountOptions,
      props: { mode: 'admin' },
    });

    expect(wrapper.classes()).toContain('auth-shell--admin');
    expect(wrapper.attributes('dir')).toBe('rtl');
    expect(wrapper.text()).toContain('auth_admin_headline_first_accent');
    expect(wrapper.text()).toContain('auth_admin_headline_second_accent');
    expect(wrapper.text()).toContain('auth_visual_admin_title');
    expect(wrapper.find('.organization-construction').exists()).toBe(false);
    expect(wrapper.find('.admin-estimation').exists()).toBe(true);
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
