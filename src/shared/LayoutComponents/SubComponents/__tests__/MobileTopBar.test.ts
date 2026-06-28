import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import MobileTopBar from '../MobileTopBar.vue';

describe('MobileTopBar', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('renders the brand and emits openSidebar from menu button', async () => {
    const wrapper = mount(MobileTopBar, {
      global: {
        mocks: {
          $t: (key: string) => key,
        },
      },
    });

    expect(wrapper.text()).toContain('BuildHub');

    await wrapper.find('.mobile-menu-btn').trigger('click');

    expect(wrapper.emitted('openSidebar')).toHaveLength(1);
  });
});
