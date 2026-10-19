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
import { priceRecord } from '../../../__tests__/price-fixtures';
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
    routes: [
      { path: '/organization/execution-quotes/show/:id/procurement', component: Page },
      {
        path: '/organization/execution-quotes/show/:id/procurement/purchase-orders/add',
        component: { template: '<main class="purchase-order-page" />' },
      },
    ],
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
  expect(rows[0]?.text()).not.toContain('Review Purchase Order');
  expect(rows[0]?.text()).toContain('View Prices');
  expect(rows[0]?.text()).toContain('View Purchase Order');
  expect(rows[1]?.text()).toContain('View Purchase Order');
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

it('navigates from the clicked saved offer with both request and offer IDs', async () => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  );
  const post = mockNetwork();
  let saved = false;
  const order = {
    ...orderRecord(),
    purchase_request: { ...orderRecord().purchase_request, id: 2 },
    purchase_request_price: { ...orderRecord().purchase_request_price, id: 4 },
  };
  post.mockImplementation(async (request) => {
    if (request.url.includes('fetch_purchase_requests'))
      return response({
        status: true,
        data: [{ ...requestRecord(), id: 2, status: saved ? 3 : 1 }],
      });
    if (request.url.includes('fetch_project_timelines')) return response(overviewRecord());
    if (request.url.endsWith('/fetch_purchase_request_prices'))
      return response({
        status: true,
        data: [
          {
            id: 5,
            purchase_request_id: 2,
            supplier: { id: 9, title: 'Other Supplier' },
            price: '1700.00',
            duration: 5,
            duration_type: 1,
          },
          {
            id: 4,
            purchase_request_id: 2,
            supplier: { id: 3, title: 'Selected Supplier' },
            price: '1500.00',
            duration: 2,
            duration_type: 2,
          },
        ],
      });
    if (request.url.endsWith('/fetch_purchase_order'))
      return response({ status: true, data: saved ? order : null });
    if (request.url.endsWith('/store_purchase_order')) {
      saved = true;
      return response({ status: true });
    }
    return response({ status: true, data: { id: 140 } });
  });
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/organization/execution-quotes/show/:id/procurement', component: Page },
      {
        path: '/organization/execution-quotes/show/:id/procurement/purchase-orders/add',
        component: { template: '<main class="purchase-order-page" />' },
      },
    ],
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
  await wrapper.get('[aria-label="View supplier prices for purchase request #2"]').trigger('click');
  await flushPromises();
  const offerRow = wrapper
    .findAll('#purchase-request-prices tbody tr')
    .find((row) => row.text().includes('Selected Supplier'));
  if (!offerRow) throw new Error('Missing saved supplier offer');
  await offerRow.get('button').trigger('click');
  await flushPromises();
  expect(router.currentRoute.value.path).toBe(
    '/organization/execution-quotes/show/140/procurement/purchase-orders/add',
  );
  expect(router.currentRoute.value.query).toEqual({ requestId: '2', offerId: '4' });
  expect(wrapper.find('.purchase-order-page').exists()).toBe(true);
  expect(wrapper.find('form').exists()).toBe(false);
  expect(post.mock.calls.some((call) => call[0].url.endsWith('/store_purchase_order'))).toBe(false);
});

it('fetches an empty order from a Pending Purchase Request row using only its ID, without opening issuance', async () => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  );
  const post = mockNetwork();
  post.mockImplementation(async (request) => {
    if (request.url.endsWith('/fetch_purchase_requests'))
      return response({ status: true, data: [{ ...requestRecord(), id: 2 }] });
    if (request.url.includes('fetch_project_timelines')) return response(overviewRecord());
    if (request.url.endsWith('/fetch_purchase_order'))
      return response({ status: true, data: null });
    return response({ status: true, data: { id: 140 } });
  });
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/organization/execution-quotes/show/:id/procurement', component: Page },
      {
        path: '/organization/execution-quotes/show/:id/procurement/purchase-orders/add',
        component: { template: '<main class="purchase-order-page" />' },
      },
    ],
  });
  await router.push('/organization/execution-quotes/show/140/procurement');
  const wrapper = mount(
    { template: '<RouterView />' },
    {
      global: {
        plugins: [router, PrimeVue],
        stubs: { Dialog: { template: '<section><slot /></section>' } },
      },
    },
  );
  await flushPromises();
  const row = wrapper.get('.procurement-table tbody tr');
  const view = row.findAll('button').find((button) => button.text() === 'View Purchase Order');
  if (!view) throw new Error('Missing request-level Fetch action');
  await view.trigger('click');
  await flushPromises();
  expect(
    post.mock.calls.find((call) => call[0].url.endsWith('/fetch_purchase_order'))?.[0].data,
  ).toEqual({ purchase_request_id: 2 });
  expect(wrapper.text()).toContain('No confirmed purchase order exists yet.');
  expect(wrapper.find('form').exists()).toBe(false);
  expect(wrapper.findAll('button').some((button) => button.text() === 'Issue Purchase Order')).toBe(
    false,
  );
  expect(
    post.mock.calls.some(
      (call) =>
        call[0].url.endsWith('/fetch_purchase_request_prices') ||
        call[0].url.endsWith('/store_purchase_order'),
    ),
  ).toBe(false);
});

it('opens the create page from the Supplier Prices header with the selected request', async () => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  );
  const post = mockNetwork();
  let saved = false;
  post.mockImplementation(async (request) => {
    if (request.url.endsWith('/fetch_purchase_requests'))
      return response({
        status: true,
        data: [{ ...requestRecord(), id: 20, status: saved ? 3 : 1 }],
      });
    if (request.url.includes('fetch_project_timelines')) return response(overviewRecord());
    if (request.url.endsWith('/fetch_purchase_order'))
      return response({
        status: true,
        data: saved
          ? { ...orderRecord(), purchase_request: { ...orderRecord().purchase_request, id: 20 } }
          : null,
      });
    if (request.url.endsWith('/fetch_purchase_request_prices'))
      return response({
        status: true,
        data: [4, 5].map((id) => ({
          id,
          purchase_request_id: 20,
          supplier: { id: id + 10, title: `Supplier ${id}` },
          price: '1500.00',
          duration: 2,
          duration_type: 2,
        })),
      });
    if (request.url.endsWith('/store_purchase_order')) {
      saved = true;
      return response({ status: true });
    }
    return response({ status: true, data: { id: 140 } });
  });
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/organization/execution-quotes/show/:id/procurement', component: Page },
      {
        path: '/organization/execution-quotes/show/:id/procurement/purchase-orders/add',
        component: { template: '<main class="purchase-order-page" />' },
      },
    ],
  });
  await router.push('/organization/execution-quotes/show/140/procurement');
  const wrapper = mount(
    { template: '<RouterView />' },
    {
      global: {
        plugins: [router, PrimeVue],
        stubs: { Dialog: { template: '<section><slot /></section>' } },
      },
    },
  );
  await flushPromises();
  await wrapper
    .get('[aria-label="View supplier prices for purchase request #20"]')
    .trigger('click');
  await flushPromises();
  const issue = wrapper
    .findAll('#purchase-request-prices header button')
    .find((button) => button.text() === 'Issue Purchase Order');
  if (!issue) throw new Error('Missing Supplier Prices header action');
  await issue.trigger('click');
  await flushPromises();
  expect(router.currentRoute.value.path).toBe(
    '/organization/execution-quotes/show/140/procurement/purchase-orders/add',
  );
  expect(router.currentRoute.value.query).toEqual({ requestId: '20' });
  expect(wrapper.find('.purchase-order-page').exists()).toBe(true);
  expect(wrapper.find('form').exists()).toBe(false);
  expect(post.mock.calls.some((call) => call[0].url.endsWith('/store_purchase_order'))).toBe(false);
});

it('opens the create page from Add Purchase Order without a dialog', async () => {
  const post = mockNetwork();
  post.mockImplementation(async (request) =>
    response(
      request.url.includes('fetch_purchase_requests')
        ? { status: true, data: [requestRecord()] }
        : request.url.includes('fetch_project_timelines')
          ? overviewRecord()
          : { status: true, data: { id: 140 } },
    ),
  );
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/organization/execution-quotes/show/:id/procurement', component: Page },
      {
        path: '/organization/execution-quotes/show/:id/procurement/purchase-orders/add',
        component: { template: '<main class="purchase-order-page" />' },
      },
    ],
  });
  await router.push('/organization/execution-quotes/show/140/procurement');
  const wrapper = mount(
    { template: '<RouterView />' },
    { global: { plugins: [router, PrimeVue], stubs: { ProjectWorkspaceNav: true } } },
  );
  await flushPromises();
  const add = wrapper.findAll('button').find((button) => button.text() === 'Add Purchase Order');
  if (!add) throw new Error('Missing Add Purchase Order action');
  await add.trigger('click');
  await flushPromises();
  expect(router.currentRoute.value.path).toBe(
    '/organization/execution-quotes/show/140/procurement/purchase-orders/add',
  );
  expect(router.currentRoute.value.query).toEqual({});
  expect(wrapper.find('.purchase-order-page').exists()).toBe(true);
  expect(post.mock.calls.some((call) => call[0].url.endsWith('/store_purchase_order'))).toBe(false);
  wrapper.unmount();
});

it('restores the selected request when returning to Procurement', async () => {
  const post = mockNetwork();
  post.mockImplementation(async (request) =>
    response(
      request.url.includes('fetch_purchase_requests')
        ? { status: true, data: [requestRecord()] }
        : request.url.includes('fetch_purchase_request_prices')
          ? { status: true, data: [priceRecord(3, 15, 1)] }
          : request.url.includes('fetch_project_timelines')
            ? overviewRecord()
            : { status: true, data: { id: 140 } },
    ),
  );
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/organization/execution-quotes/show/:id/procurement', component: Page }],
  });
  await router.push('/organization/execution-quotes/show/140/procurement?requestId=1');
  const wrapper = mount(
    { template: '<RouterView />' },
    { global: { plugins: [router, PrimeVue], stubs: { ProjectWorkspaceNav: true } } },
  );
  await flushPromises();
  expect(wrapper.get('.procurement-offers').text()).toContain('Purchase Request #1');
  expect(post.mock.calls.some((call) => call[0].url.endsWith('/fetch_purchase_request_prices'))).toBe(true);
  wrapper.unmount();
});
