import { mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { describe, expect, it, vi } from 'vitest';
import SystemIdentityShowModel from '../../../core/models/system.identity.show.model';
import SystemIdentityForm from '../SystemIdentityForm.vue';

vi.mock('vue-router', () => ({
  onBeforeRouteLeave: vi.fn(),
}));

describe('SystemIdentityForm.vue', () => {
  const mountComponent = () => {
    return mount(SystemIdentityForm, {
      props: {
        identity: SystemIdentityShowModel.example,
      },
      global: {
        plugins: [createPinia()],
        mocks: {
          $t: (key: string) => key,
        },
      },
    });
  };

  it('renders identity form fields and emits initial params', () => {
    const wrapper = mountComponent();

    expect(wrapper.text()).toContain('system_identity.form_title');
    expect(wrapper.find('input[type="text"]').exists()).toBe(true);
    expect(wrapper.emitted('updateData')).toBeTruthy();
  });
});
