import { expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { createMemoryHistory, createRouter } from 'vue-router';
import MaterialReceiptShortcut from '../MaterialReceiptShortcut.vue';

it('opens the existing Warehouse entry for the current quote', async () => {
  const router = createRouter({ history: createMemoryHistory(), routes: [] });
  await router.push('/organization/execution-quotes/show/140');
  const wrapper = mount(MaterialReceiptShortcut, {
    props: { quoteId: 140 },
    global: { plugins: [router] },
  });
  expect(wrapper.text()).toContain('Warehouse');
  expect(wrapper.find('a').attributes('href')).toBe(
    '/organization/execution-quotes/show/140/warehouse/material-receipt',
  );
  wrapper.unmount();
});
