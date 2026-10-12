import { mount } from '@vue/test-utils';
import { createMemoryHistory, createRouter } from 'vue-router';
import { expect, it } from 'vitest';
import WorkItemsShortcut from '../WorkItemsShortcut.vue';
it('opens current Quote without fabricated metrics or unrelated floor illustration', async () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/:pathMatch(.*)*', component: { template: '<div />' } }],
  });
  await router.push('/mainportal/execution-quotes/show/140');
  const wrapper = mount(WorkItemsShortcut, {
    props: { quoteId: 140 },
    global: { plugins: [router], mocks: { $t: (key: string) => key } },
  });
  expect(wrapper.get('a').attributes('href')).toBe(
    '/mainportal/execution-quotes/show/140/work-items',
  );
  expect(wrapper.findAll('dd')).toHaveLength(0);
  expect(wrapper.find('svg').exists()).toBe(false);
  wrapper.unmount();
});
