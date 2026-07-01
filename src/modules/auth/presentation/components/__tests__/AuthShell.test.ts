import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import AuthShell from '../AuthShell.vue';

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
  it('renders organization login content with the slotted form', () => {
    const wrapper = mount(AuthShell, {
      ...mountOptions,
      props: { mode: 'organization' },
    });

    expect(wrapper.classes()).toContain('auth-shell--organization');
    expect(wrapper.text()).toContain('auth_organization_headline_first_accent');
    expect(wrapper.text()).toContain('auth_organization_headline_second_accent');
    expect(wrapper.text()).toContain('auth_organization_card_estimates');
    expect(wrapper.find('form.login-form').exists()).toBe(true);
  });

  it('renders admin login content', () => {
    const wrapper = mount(AuthShell, {
      ...mountOptions,
      props: { mode: 'admin' },
    });

    expect(wrapper.classes()).toContain('auth-shell--admin');
    expect(wrapper.text()).toContain('auth_admin_headline_first_accent');
    expect(wrapper.text()).toContain('auth_admin_headline_second_accent');
    expect(wrapper.text()).toContain('auth_admin_card_roles');
  });
});
