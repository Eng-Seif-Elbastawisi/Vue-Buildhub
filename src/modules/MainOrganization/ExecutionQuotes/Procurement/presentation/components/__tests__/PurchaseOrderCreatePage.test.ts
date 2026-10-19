import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { createMemoryHistory, createRouter } from 'vue-router';
import PrimeVue from 'primevue/config';
import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
import PurchaseOrderCreatePage from '../PurchaseOrderCreatePage.vue';
import SupplierPricesManagePage from '../SupplierPricesManagePage.vue';
import ProcurementDiscardConfirmation from '../ProcurementDiscardConfirmation.vue';
import PurchaseOrderController from '../../controllers/purchase.order.controller';
import PurchaseRequestController from '../../controllers/purchase-request.controller';
import { requestRecord } from '../../../__tests__/fixtures';
import { priceRecord } from '../../../__tests__/price-fixtures';
import { orderRecord } from '../../../__tests__/order-fixtures';
import { mockNetwork, response } from '../../../../SiteTeam/__tests__/network';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';

const base = '/organization/execution-quotes/show/140/procurement';
let post: ReturnType<typeof mockNetwork>;
let saved = false;
let supplierPrice = '1500.00';

beforeEach(() => {
  saved = false;
  supplierPrice = '1500.00';
  post = mockNetwork();
  post.mockImplementation(async (request) => {
    if (request.url.endsWith('/fetch_purchase_requests'))
      return response({ status: true, data: [{ ...requestRecord(), status: saved ? 3 : 1 }] });
    if (request.url.endsWith('/fetch_purchase_request_prices'))
      return response({
        status: true,
        data: [
          {
            ...priceRecord(3, 15, 1),
            price: supplierPrice,
            supplier: { id: 3, title: 'Supplier 3' },
          },
        ],
      });
    if (request.url.endsWith('/store_purchase_request_prices')) {
      supplierPrice = Number(request.data?.suppliers?.[0]?.price).toFixed(2);
      return response({ status: true });
    }
    if (request.url.endsWith('/store_purchase_order')) {
      saved = true;
      return response({ status: true });
    }
    if (request.url.endsWith('/fetch_purchase_order'))
      return response({ status: true, data: saved ? orderRecord() : null });
    throw new Error(`Unexpected endpoint: ${request.url}`);
  });
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  );
});
afterEach(() => {
  PurchaseOrderController.getInstance().release();
  PurchaseRequestController.getInstance().release();
  vi.unstubAllGlobals();
});

async function mountPage(locale: 'en' | 'ar' = 'en', query = '?requestId=1&offerId=15') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/organization/execution-quotes/show/:id', component: { template: '<div />' } },
      {
        path: '/organization/execution-quotes/show/:id/procurement',
        component: { template: '<main class="procurement-return" />' },
      },
      {
        path: '/organization/execution-quotes/show/:id/procurement/purchase-orders/add',
        component: PurchaseOrderCreatePage,
      },
      {
        path: '/organization/execution-quotes/show/:id/procurement/purchase-requests/:purchaseRequestId/supplier-prices',
        component: SupplierPricesManagePage,
      },
    ],
  });
  await router.push(`${base}/purchase-orders/add${query}`);
  const localization = createI18n({ legacy: false, locale, messages: { en, ar } });
  const wrapper = mount(
    { template: '<RouterView />' },
    {
      global: {
        plugins: [router, PrimeVue, localization],
        mocks: { $t: localization.global.t },
        stubs: { ProjectWorkspaceNav: true, FieldHelpIcon: true },
      },
    },
  );
  await flushPromises();
  return { router, wrapper };
}

it.each(['en', 'ar'] as const)(
  'restores request and offer on a direct %s page load',
  async (locale) => {
    const { router, wrapper } = await mountPage(locale);
    expect(wrapper.get('.purchase-order-create').attributes('dir')).toBe(
      locale === 'ar' ? 'rtl' : 'ltr',
    );
    expect(wrapper.get('#order-offer-15').element).toHaveProperty('checked', true);
    expect(wrapper.get('#purchase-order-request')).toBeDefined();
    expect(wrapper.get('.purchase-order-request .procurement-create__summary').text()).toContain(
      'Responsible Employee',
    );
    expect(wrapper.get('.purchase-order-breadcrumbs').text()).toContain(
      locale === 'ar' ? 'إضافة أمر شراء' : 'Add Purchase Order',
    );
    expect(router.currentRoute.value.query).toEqual({ requestId: '1', offerId: '15' });
    wrapper.unmount();
  },
);

it('keeps request context on cancel without storing an order', async () => {
  const { router, wrapper } = await mountPage();
  await wrapper
    .findAll('button')
    .find((button) => button.text() === 'Cancel')
    ?.trigger('click');
  await flushPromises();
  expect(router.currentRoute.value.path).toBe(base);
  expect(router.currentRoute.value.query).toEqual({ requestId: '1' });
  expect(post.mock.calls.some((call) => call[0].url.endsWith('/store_purchase_order'))).toBe(false);
  wrapper.unmount();
});

it('confirms unsaved order edits on back and keeps them when editing continues', async () => {
  const { router, wrapper } = await mountPage();
  await wrapper.get('#purchase-order-note').setValue('Keep this note');
  await wrapper
    .findAll('button')
    .find((button) => button.text() === 'Back to Procurement')
    ?.trigger('click');
  await flushPromises();
  const prompt = wrapper.getComponent(ProcurementDiscardConfirmation);
  expect(prompt.props('visible')).toBe(true);
  prompt.vm.$emit('keep');
  await flushPromises();
  expect(router.currentRoute.value.path).toBe(`${base}/purchase-orders/add`);
  expect(wrapper.get<HTMLTextAreaElement>('#purchase-order-note').element.value).toBe(
    'Keep this note',
  );
  await wrapper
    .findAll('button')
    .find((button) => button.text() === 'Cancel')
    ?.trigger('click');
  await flushPromises();
  prompt.vm.$emit('discard');
  await flushPromises();
  expect(router.currentRoute.value.path).toBe(base);
  expect(post.mock.calls.some((call) => call[0].url.endsWith('/store_purchase_order'))).toBe(false);
  wrapper.unmount();
});

it('asks the browser to confirm a refresh when the order has unsaved changes', async () => {
  const { wrapper } = await mountPage();
  await wrapper.get('#purchase-order-note').setValue('Draft note');
  const event = new Event('beforeunload', { cancelable: true });
  window.dispatchEvent(event);
  expect(event.defaultPrevented).toBe(true);
  wrapper.unmount();
});

it('refreshes the request and created order before navigating back', async () => {
  const { router, wrapper } = await mountPage();
  await wrapper.get('#purchase-order-date').setValue('2026-10-14');
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  expect(router.currentRoute.value.path).toBe(base);
  expect(router.currentRoute.value.query).toEqual({ requestId: '1' });
  expect(
    post.mock.calls.filter((call) => call[0].url.endsWith('/store_purchase_order')),
  ).toHaveLength(1);
  expect(post.mock.calls.some((call) => call[0].url.endsWith('/fetch_purchase_order'))).toBe(true);
  expect(
    post.mock.calls.filter((call) => call[0].url.endsWith('/fetch_purchase_requests')).length,
  ).toBeGreaterThan(1);
  wrapper.unmount();
});

it('lets a direct page load select a request and persists it in the URL', async () => {
  const { router, wrapper } = await mountPage('en', '');
  expect(wrapper.find('form').exists()).toBe(false);
  const selector = wrapper.getComponent(UpdatedCustomInputSelect);
  selector.vm.$emit('update:modelValue', selector.props('staticOptions')[0]);
  await flushPromises();
  expect(router.currentRoute.value.query).toEqual({ requestId: '1' });
  expect(wrapper.find('form').exists()).toBe(true);
  wrapper.unmount();
});

it('keeps the page and entered values after a rejected issue', async () => {
  const normal = post.getMockImplementation();
  if (!normal) throw new Error('Missing network mock');
  post.mockImplementation((request) =>
    request.url.endsWith('/store_purchase_order')
      ? Promise.resolve(response({ status: false, message: 'Status conflict' }))
      : request.url.endsWith('/fetch_purchase_requests')
        ? Promise.resolve(response({ status: true, data: [{ ...requestRecord(), id: 2 }] }))
        : request.url.endsWith('/fetch_purchase_request_prices')
          ? Promise.resolve(response({ status: true, data: [priceRecord(3, 15, 2)] }))
          : normal(request),
  );
  const { router, wrapper } = await mountPage('en', '?requestId=2&offerId=15');
  await wrapper.get('#purchase-order-date').setValue('2026-10-14');
  await wrapper.get('#purchase-order-note').setValue('Keep this draft');
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  expect(router.currentRoute.value.path).toBe(`${base}/purchase-orders/add`);
  expect(wrapper.get<HTMLInputElement>('#purchase-order-date').element.value).toBe('2026-10-14');
  expect(wrapper.get<HTMLTextAreaElement>('#purchase-order-note').element.value).toBe(
    'Keep this draft',
  );
  expect(wrapper.get('#order-offer-15').element).toHaveProperty('checked', true);
  expect(
    post.mock.calls.filter((call) => call[0].url.endsWith('/store_purchase_order')),
  ).toHaveLength(1);
  wrapper.unmount();
});

it('returns from Supplier Prices to the selected request with refreshed offers', async () => {
  const { router, wrapper } = await mountPage('en', '?requestId=1');
  await wrapper
    .findAll('button')
    .find((button) => button.text() === 'Manage Supplier Prices')
    ?.trigger('click');
  await flushPromises();
  expect(router.currentRoute.value.path).toBe(`${base}/purchase-requests/1/supplier-prices`);
  expect(router.currentRoute.value.query).toEqual({ returnTo: 'order' });
  await wrapper.get('input[inputmode="decimal"]').setValue('1777.25');
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  expect(router.currentRoute.value.path).toBe(`${base}/purchase-orders/add`);
  expect(router.currentRoute.value.query).toEqual({ requestId: '1' });
  expect(wrapper.get('.purchase-order-offer').text()).toContain('1777.25');
  expect(
    post.mock.calls.filter((call) => call[0].url.endsWith('/store_purchase_order')),
  ).toHaveLength(0);
  wrapper.unmount();
});
