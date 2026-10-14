import { afterEach, expect, it, vi } from 'vitest';
import { mount, flushPromises, enableAutoUnmount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { createI18n } from 'vue-i18n';
import PrimeVue from 'primevue/config';
import Page from '../ProcurementPage.vue';
import Requests from '../../controllers/purchase-request.controller';
import Orders from '../../controllers/purchase.order.controller';
import { mockNetwork, response } from '../../../../SiteTeam/__tests__/network';
import { requestRecord, overviewRecord } from '../../../__tests__/fixtures';
import { orderRecord } from '../../../__tests__/order-fixtures';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';
enableAutoUnmount(afterEach);
afterEach(() => {
  Requests.getInstance().release();
  Orders.getInstance().release();
  vi.unstubAllGlobals();
});
it('integrates contextual actions without fetching an order for every row, and clears details on Quote navigation', async () => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  );
  const post = mockNetwork();
  post.mockImplementation(async (request) =>
    response(
      request.url.includes('fetch_purchase_requests')
        ? {
            status: true,
            data: [1, 2, 3].map((status) => ({
              ...requestRecord(),
              id: status,
              status,
              quote_id: request.data.quote_id,
            })),
          }
        : request.url.includes('fetch_project_timelines')
          ? overviewRecord()
          : request.url.endsWith('/fetch_purchase_order')
            ? {
                status: true,
                data: {
                  ...orderRecord(),
                  purchase_request: { ...orderRecord().purchase_request, id: 3 },
                },
              }
            : { status: true, data: { id: 140 } },
    ),
  );
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/organization/execution-quotes/show/:id/procurement', component: Page }],
  });
  await router.push('/organization/execution-quotes/show/140/procurement');
  const localization = createI18n({ legacy: false, locale: 'en', messages: { en, ar } });
  const wrapper = mount(
    { template: '<RouterView />' },
    {
      global: {
        plugins: [router, PrimeVue, localization],
        mocks: { $t: localization.global.t },
        stubs: { Dialog: { template: '<section><slot /></section>' } },
      },
    },
  );
  await flushPromises();
  expect(post.mock.calls.some((call) => call[0].url.includes('purchase_order'))).toBe(false);
  const rows = wrapper.findAll('.procurement-table tbody > tr');
  expect(rows[0]?.text()).toContain('Review Purchase Order');
  expect(rows[1]?.text()).not.toContain('Purchase Order');
  expect(rows[2]?.text()).toContain('View Purchase Order');
  await rows[2]
    ?.findAll('button')
    .find((button) => button.text() === 'View Purchase Order')
    ?.trigger('click');
  await flushPromises();
  expect(
    post.mock.calls.find((call) => call[0].url.endsWith('/fetch_purchase_order'))?.[0].data,
  ).toEqual({ purchase_request_id: 3 });
  expect(wrapper.text()).toContain('Techlab Employee');
  expect(wrapper.find('form').exists()).toBe(false);
  await router.push('/organization/execution-quotes/show/141/procurement');
  await flushPromises();
  expect(wrapper.text()).not.toContain('Techlab Employee');
  expect(wrapper.get('.workspace-nav [aria-current="page"]').attributes('href')).toContain(
    '/141/procurement',
  );
});
