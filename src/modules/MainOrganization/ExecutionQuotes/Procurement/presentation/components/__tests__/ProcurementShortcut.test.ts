import { expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { createMemoryHistory, createRouter } from 'vue-router';
import ProcurementShortcut from '../ProcurementShortcut.vue';
it.each(['/organization', '/mainportal'])(
  'opens Procurement in the same Quote under %s without fake metrics',
  async (prefix) => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/:pathMatch(.*)*', component: { template: '<div />' } }],
    });
    await router.push(`${prefix}/execution-quotes/show/140`);
    const wrapper = mount(ProcurementShortcut, {
      props: { quoteId: 140 },
      global: { plugins: [router], mocks: { $t: (key: string) => key } },
    });
    expect(wrapper.get('a').attributes('href')).toBe(
      `${prefix}/execution-quotes/show/140/procurement`,
    );
    expect(wrapper.findAll('dd')).toHaveLength(0);
    wrapper.unmount();
  },
);
