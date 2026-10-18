import { expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { createMemoryHistory, createRouter } from 'vue-router';
import WarehouseFeatureNav from '../WarehouseFeatureNav.vue';

it.each(['organization', 'mainportal'])(
  'links both Warehouse features inside the %s quote',
  async (prefix) => {
    const router = createRouter({ history: createMemoryHistory(), routes: [] });
    const currentPath = `/${prefix}/execution-quotes/show/140/warehouse/material-disbursement`;
    const wrapper = mount(WarehouseFeatureNav, {
      props: { quoteId: 140, currentPath, active: 'disbursement' },
      global: { plugins: [router] },
    });
    const links = wrapper.findAll('a');
    expect(links[0]?.attributes('href')).toBe(
      `/${prefix}/execution-quotes/show/140/warehouse/material-receipt`,
    );
    expect(links[1]?.attributes('href')).toBe(currentPath);
    expect(links[1]?.attributes('aria-current')).toBe('page');
    wrapper.unmount();
  },
);
