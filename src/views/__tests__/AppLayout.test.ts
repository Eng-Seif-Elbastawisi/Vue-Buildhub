import { mount } from '@vue/test-utils';
import { defineComponent, nextTick } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import AppLayout from '../AppLayout.vue';

describe('AppLayout', () => {
  it('remounts the current page when the language changes', async () => {
    const pageMounted = vi.fn();
    const RouterViewStub = defineComponent({
      name: 'RouterView',
      setup() {
        pageMounted();
      },
      template: '<div class="routed-page" />',
    });

    const wrapper = mount(AppLayout, {
      global: {
        stubs: {
          DashboardLayout: {
            template: '<main><slot /></main>',
          },
          RouterView: RouterViewStub,
        },
      },
    });

    expect(pageMounted).toHaveBeenCalledTimes(1);

    wrapper.vm.$i18n.locale = 'ar';
    await nextTick();

    expect(pageMounted).toHaveBeenCalledTimes(2);
  });
});
