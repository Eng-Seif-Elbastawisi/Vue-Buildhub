import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import SystemIdentitySettings from '../SystemIdentitySettings.vue';

vi.mock('vue-router', () => ({
  useRoute: () => ({ fullPath: '/organization/system-identity' }),
  onBeforeRouteLeave: vi.fn(),
}));

vi.mock('../../controllers/system.identity.controller', () => ({
  default: {
    getInstance: () => ({
      showSetting: vi.fn(),
      storeSetting: vi.fn(),
      itemData: { value: undefined },
      errorMessage: { value: '' },
    }),
  },
}));

describe('SystemIdentitySettings.vue', () => {
  it('renders one-page system identity settings', () => {
    const wrapper = mount(SystemIdentitySettings, {
      global: {
        stubs: {
          SystemIdentityForm: {
            template: '<div>system identity form</div>',
          },
        },
        mocks: {
          $t: (key: string) => key,
        },
      },
    });

    expect(wrapper.text()).toContain('system_identity.title');
    expect(wrapper.text()).toContain('system identity form');
    expect(wrapper.text()).toContain('system_identity.save');
  });
});
