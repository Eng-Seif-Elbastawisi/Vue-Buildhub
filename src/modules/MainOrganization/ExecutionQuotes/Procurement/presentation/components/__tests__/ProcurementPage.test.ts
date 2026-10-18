import { afterEach, expect, it, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { createRouter, createMemoryHistory } from 'vue-router';
import PrimeVue from 'primevue/config';
import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
import TitleInterface from '@/base/Data/Models/titleInterface';
import { priceRecord } from '../../../__tests__/price-fixtures';
import ProcurementPage from '../ProcurementPage.vue';
import PurchaseRequestCreatePage from '../PurchaseRequestCreatePage.vue';
import SupplierPricesManagePage from '../SupplierPricesManagePage.vue';
import PurchaseRequestController from '../../controllers/purchase-request.controller';
import { mockNetwork, response } from '../../../../SiteTeam/__tests__/network';
import { requestRecord, overviewRecord } from '../../../__tests__/fixtures';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';
afterEach(() => {
  PurchaseRequestController.getInstance().release();
  vi.unstubAllGlobals();
});
it.each(['en', 'ar'])(
  'renders real requirements, confirmed status labels and read-only details in %s',
  async (locale) => {
    const post = mockNetwork();
    post.mockImplementation(async (request) =>
      response(
        request.url.includes('fetch_purchase_requests')
          ? {
              status: true,
              data: [1, 2, 3].map((status) => ({ ...requestRecord(), id: status, status })),
            }
          : request.url.includes('fetch_project_timelines')
            ? overviewRecord()
            : { status: true, data: { id: 140 } },
      ),
    );
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/organization/execution-quotes/show/:id/procurement',
          component: { template: '<div />' },
        },
      ],
    });
    await router.push('/organization/execution-quotes/show/140/procurement');
    const localization = createI18n({ legacy: false, locale, messages: { en, ar } });
    const wrapper = mount(ProcurementPage, {
      global: {
        plugins: [router, PrimeVue, localization],
        mocks: { $t: localization.global.t },
        stubs: { Dialog: { template: '<section><slot /></section>' } },
      },
    });
    await flushPromises();
    expect(wrapper.findAll('.procurement-status').map((badge) => badge.text())).toEqual(
      locale === 'en' ? ['Pending', 'Rejected', 'Confirmed'] : ['قيد الانتظار', 'مرفوض', 'مؤكد'],
    );
    expect(wrapper.text()).toContain('Responsible Employee');
    expect(wrapper.text()).not.toContain('procurement.');
    const view = wrapper.get('[aria-controls="requirement-details-1"]');
    await view.trigger('click');
    expect(view.attributes('aria-expanded')).toBe('true');
    expect(wrapper.get('#requirement-details-1').text()).toContain('10.00');
    expect(wrapper.get('#requirement-details-1').findAll('button')).toHaveLength(0);
    expect(wrapper.get('.workspace-nav [aria-current="page"]').attributes('href')).toContain(
      '/140/procurement',
    );
    wrapper.unmount();
  },
);
it('navigates to the request page with the Quote context and clears old requests on Quote navigation', async () => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  );
  const post = mockNetwork();
  post.mockImplementation(async (request) =>
    response(
      request.url.includes('fetch_purchase_requests')
        ? { status: true, data: request.data?.quote_id === 140 ? [requestRecord()] : [] }
        : request.url.includes('fetch_project_timelines')
          ? overviewRecord()
          : request.url.includes('show_quote')
            ? { status: true, data: { id: request.data?.quote_id } }
            : { status: true, data: [] },
    ),
  );
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/organization/execution-quotes/show/:id/procurement',
        component: ProcurementPage,
      },
      {
        path: '/organization/execution-quotes/show/:id/procurement/purchase-requests/add',
        component: PurchaseRequestCreatePage,
      },
    ],
  });
  await router.push('/organization/execution-quotes/show/140/procurement');
  const wrapper = mount(
    { template: '<RouterView />' },
    {
      global: {
        plugins: [
          router,
          PrimeVue,
          createI18n({ legacy: false, locale: 'en', messages: { en, ar } }),
        ],
        stubs: { Dialog: { template: '<section><slot /></section>' } },
      },
    },
  );
  await flushPromises();
  await wrapper.get('.procurement-header button').trigger('click');
  await flushPromises();
  expect(router.currentRoute.value.path).toBe(
    '/organization/execution-quotes/show/140/procurement/purchase-requests/add',
  );
  expect(router.currentRoute.value.params.id).toBe('140');
  expect(wrapper.find('form').exists()).toBe(true);
  await router.push('/organization/execution-quotes/show/141/procurement');
  await flushPromises();
  expect(wrapper.find('form').exists()).toBe(false);
  expect(wrapper.text()).not.toContain('Responsible Employee');
  expect(wrapper.text()).toContain('No purchase requests yet');
  wrapper.unmount();
});
it('opens Supplier Prices on its page and guards Quote navigation with unsaved edits', async () => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  );
  const post = mockNetwork();
  post.mockImplementation(async (request) =>
    response(
      request.url.includes('fetch_purchase_request_prices')
        ? {
            status: true,
            data: [
              {
                id: 15,
                purchase_request_id: 1,
                supplier: { id: 3, name: 'ABC Supplier' },
                price: '1500.00',
                duration: 2,
                duration_type: 2,
                created_at: null,
              },
            ],
          }
        : request.url.includes('fetch_purchase_requests')
          ? { status: true, data: [requestRecord()] }
          : request.url.includes('fetch_project_timelines')
            ? overviewRecord()
            : request.url.includes('show_quote')
              ? { status: true, data: { id: 140 } }
              : { status: true, data: [] },
    ),
  );
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/organization/execution-quotes/show/:id/procurement', component: ProcurementPage },
      {
        path: '/organization/execution-quotes/show/:id/procurement/purchase-requests/:purchaseRequestId/supplier-prices',
        component: SupplierPricesManagePage,
      },
    ],
  });
  await router.push('/organization/execution-quotes/show/140/procurement');
  const wrapper = mount(
    { template: '<RouterView />' },
    {
      global: {
        plugins: [
          router,
          PrimeVue,
          createI18n({ legacy: false, locale: 'en', messages: { en, ar } }),
        ],
        stubs: { Dialog: { template: '<section><slot /></section>' } },
      },
    },
  );
  await flushPromises();
  await wrapper.get('[aria-label="View supplier prices for purchase request #1"]').trigger('click');
  await flushPromises();
  expect(wrapper.get('.procurement-offers').text()).toContain('Purchase Request #1');
  expect(
    post.mock.calls.find((call) => call[0].url.includes('fetch_purchase_request_prices'))?.[0].data,
  ).toEqual({ purchase_request_id: 1 });
  expect(wrapper.get('.procurement-offers').find('form').exists()).toBe(false);
  await wrapper
    .findAll('button')
    .find((button) => button.text() === 'Manage Supplier Prices')
    ?.trigger('click');
  await flushPromises();
  expect(router.currentRoute.value.path).toBe(
    '/organization/execution-quotes/show/140/procurement/purchase-requests/1/supplier-prices',
  );
  expect(router.currentRoute.value.params.purchaseRequestId).toBe('1');
  await wrapper.get('input[inputmode="decimal"]').setValue('200.25');
  const navigation = router.push('/organization/execution-quotes/show/141/procurement');
  await flushPromises();
  expect(wrapper.text()).toContain('Leave this page and discard your unsaved changes?');
  await wrapper
    .findAll('button')
    .find((button) => button.text() === 'Keep Editing')
    ?.trigger('click');
  await navigation;
  expect(router.currentRoute.value.params.id).toBe('140');
  expect((wrapper.get('input[inputmode="decimal"]').element as HTMLInputElement).value).toBe(
    '200.25',
  );
  expect(
    post.mock.calls.some((call) => call[0].url.includes('store_purchase_request_prices')),
  ).toBe(false);
  wrapper.unmount();
});

it('creates the Purchase Request on its page, then saves supplier prices for that request', async () => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  );
  const post = mockNetwork();
  let requestSaved = false;
  let pricesSaved = false;
  post.mockImplementation(async (request) => {
    if (request.url.endsWith('/store_purchase_request')) {
      requestSaved = true;
      return response({ status: true });
    }
    if (request.url.endsWith('/store_purchase_request_prices')) {
      pricesSaved = true;
      return response({ status: true });
    }
    if (request.url.includes('fetch_purchase_request_prices'))
      return response({
        status: true,
        data: pricesSaved ? [{ ...priceRecord(), price: '10.25' }] : [],
      });
    if (request.url.includes('fetch_purchase_requests'))
      return response({ status: true, data: requestSaved ? [requestRecord()] : [] });
    if (request.url.includes('fetch_project_timelines')) return response(overviewRecord());
    if (request.url.includes('show_quote')) return response({ status: true, data: { id: 140 } });
    return response({ status: true, data: [] });
  });
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/organization/execution-quotes/show/:id/procurement', component: ProcurementPage },
      {
        path: '/organization/execution-quotes/show/:id/procurement/purchase-requests/add',
        component: PurchaseRequestCreatePage,
      },
      {
        path: '/organization/execution-quotes/show/:id/procurement/purchase-requests/:purchaseRequestId/supplier-prices',
        component: SupplierPricesManagePage,
      },
    ],
  });
  await router.push('/organization/execution-quotes/show/140/procurement');
  const wrapper = mount(
    { template: '<RouterView />' },
    {
      global: {
        plugins: [
          router,
          PrimeVue,
          createI18n({ legacy: false, locale: 'en', messages: { en, ar } }),
        ],
        stubs: { Dialog: { template: '<section><slot /></section>' } },
      },
    },
  );
  await flushPromises();
  expect(wrapper.text()).toContain('Create a purchase request first.');
  await wrapper
    .findAll('button')
    .find((button) => button.text() === 'New Purchase Request')
    ?.trigger('click');
  await flushPromises();
  expect(router.currentRoute.value.path).toBe(
    '/organization/execution-quotes/show/140/procurement/purchase-requests/add',
  );
  expect(wrapper.find('[inputmode="decimal"]').exists()).toBe(false);
  async function select(id: string, number: number, title: string) {
    const control = wrapper
      .findAllComponents(UpdatedCustomInputSelect)
      .find((control) => control.props('id') === id);
    if (!control) throw new Error(`Missing selector ${id}`);
    control.vm.$emit('update:modelValue', new TitleInterface({ id: number, title }));
    await flushPromises();
  }
  await select('requirement-employee', 7, 'Responsible Employee');
  await select('requirement-supply', 2, 'Company');
  await select('requirement-item-0-stage', 17, 'Main Stage');
  await select('requirement-item-0-catalog', 5, 'Material Title');
  await wrapper.get('#requirement-item-0-quantity').setValue('2.5');
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  expect(router.currentRoute.value.path).toBe(
    '/organization/execution-quotes/show/140/procurement',
  );
  expect(wrapper.find('form').exists()).toBe(false);
  expect(
    post.mock.calls.filter((call) => call[0].url.includes('purchase_request_prices')),
  ).toHaveLength(0);
  await wrapper.get('[aria-label="View supplier prices for purchase request #1"]').trigger('click');
  await flushPromises();
  expect(wrapper.findAll('table')).toHaveLength(2);
  expect(wrapper.find('form').exists()).toBe(false);
  await wrapper
    .findAll('button')
    .find((button) => button.text() === 'Add Supplier Prices')
    ?.trigger('click');
  await flushPromises();
  expect(router.currentRoute.value.path).toBe(
    '/organization/execution-quotes/show/140/procurement/purchase-requests/1/supplier-prices',
  );
  await wrapper
    .findAll('button')
    .find((button) => button.text() === 'Add Supplier')
    ?.trigger('click');
  await flushPromises();
  const supplier = wrapper
    .findAllComponents(UpdatedCustomInputSelect)
    .find((control) => String(control.props('id')).endsWith('-supplier'));
  supplier?.vm.$emit('update:modelValue', new TitleInterface({ id: 3, title: 'Supplier 3' }));
  const unit = wrapper
    .findAllComponents(UpdatedCustomInputSelect)
    .find((control) => String(control.props('id')).endsWith('-unit'));
  unit?.vm.$emit('update:modelValue', new TitleInterface({ id: 2, title: 'Week' }));
  await flushPromises();
  await wrapper.get('input[inputmode="decimal"]').setValue('10.25');
  await wrapper.get('input[type="number"]').setValue('2');
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  const mutations = post.mock.calls
    .map((call) => call[0])
    .filter((request) => request.url.includes('/store_purchase_request'));
  expect(mutations.map((request) => request.url.split('/').at(-1))).toEqual([
    'store_purchase_request',
    'store_purchase_request_prices',
  ]);
  expect(mutations[1]?.data).toEqual({
    purchase_request_id: 1,
    suppliers: [{ id: 3, price: 10.25, duration: 2, duration_type: 2 }],
  });
  expect(wrapper.find('form').exists()).toBe(false);
  expect(wrapper.get('#purchase-request-prices table').text()).toContain('10.25');
  wrapper.unmount();
});

it('filters requests by status and search locally while preserving the complete request owner state', async () => {
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
              assigned_employee: {
                id: status + 10,
                name: status === 1 ? 'Omar Hassan' : 'Sara Ahmed',
                type: 2,
              },
            })),
          }
        : request.url.includes('fetch_project_timelines')
          ? overviewRecord()
          : { status: true, data: { id: 140 } },
    ),
  );
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/organization/execution-quotes/show/:id/procurement',
        component: { template: '<div />' },
      },
    ],
  });
  await router.push('/organization/execution-quotes/show/140/procurement');
  const wrapper = mount(ProcurementPage, {
    global: {
      plugins: [router, PrimeVue],
      stubs: { Dialog: { template: '<section><slot /></section>' } },
    },
  });
  try {
    await flushPromises();
    const readCount = post.mock.calls.length;
    const pending = wrapper
      .findAll('.procurement-status-filters button')
      .find((button) => button.text() === 'Pending');
    if (!pending) throw new Error('Missing pending filter');
    await pending.trigger('click');
    expect(pending.attributes('aria-pressed')).toBe('true');
    expect(wrapper.findAll('.procurement-table tbody')).toHaveLength(1);
    expect(wrapper.get('.procurement-table').text()).toContain('Omar Hassan');
    await wrapper.get('#procurement-request-search').setValue('no matching employee');
    expect(wrapper.text()).toContain('No requests match your filters');
    const clear = wrapper.findAll('button').find((button) => button.text() === 'Clear filters');
    if (!clear) throw new Error('Missing clear filters action');
    await clear.trigger('click');
    expect(wrapper.findAll('.procurement-table tbody')).toHaveLength(3);
    await wrapper.get('#procurement-request-search').setValue('Omar');
    expect(wrapper.findAll('.procurement-table tbody')).toHaveLength(1);
    expect(PurchaseRequestController.getInstance().listState.value.data).toHaveLength(3);
    expect(post.mock.calls).toHaveLength(readCount);
    expect(post.mock.calls.some((call) => call[0].url.endsWith('/fetch_purchase_order'))).toBe(
      false,
    );
  } finally {
    wrapper.unmount();
  }
});
