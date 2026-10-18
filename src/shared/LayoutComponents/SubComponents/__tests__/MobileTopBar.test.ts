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
        stubs: {
          GlobalProjectSearch: {
            template: '<div class="mobile-project-search-stub" />',
          },
        },
      },
    });

    expect(wrapper.text()).toContain('BuildHub');
    expect(wrapper.find('.mobile-project-search-stub').exists()).toBe(true);

    await wrapper.find('[aria-label="Open sidebar"]').trigger('click');

    expect(wrapper.emitted('openSidebar')).toHaveLength(1);
  });
});
