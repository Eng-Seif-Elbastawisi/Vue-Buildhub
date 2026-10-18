import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { createMemoryHistory, createRouter } from 'vue-router';
import PrimeVue from 'primevue/config';
import SupplierPricesManagePage from '../SupplierPricesManagePage.vue';
import ProcurementDiscardConfirmation from '../ProcurementDiscardConfirmation.vue';
import PurchaseRequestController from '../../controllers/purchase-request.controller';
import PurchaseRequestPricesController from '../../controllers/purchase-request-prices.controller';
import { requestRecord } from '../../../__tests__/fixtures';
import { priceRecord } from '../../../__tests__/price-fixtures';
import { mockNetwork, response } from '../../../../SiteTeam/__tests__/network';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';

const base = '/organization/execution-quotes/show/140/procurement';
let post: ReturnType<typeof mockNetwork>;
let saved = false;
let failed = false;
let fetchFailed = false;
let status = 1;
let offers = [priceRecord(3, 15, 1), priceRecord(4, 16, 1)];
const savedOffers = () =>
  offers.map((offer) => ({
    ...offer,
    supplier: { id: offer.supplier.id, title: offer.supplier.name },
  }));

beforeEach(() => {
  saved = false;
  failed = false;
  fetchFailed = false;
  status = 1;
  offers = [priceRecord(3, 15, 1), priceRecord(4, 16, 1)];
  post = mockNetwork();
  post.mockImplementation(async (request) => {
    if (request.url.endsWith('/fetch_purchase_requests'))
      return response({ status: true, data: [{ ...requestRecord(), status }] });
    if (request.url.endsWith('/fetch_purchase_request_prices'))
      return response(
        fetchFailed
          ? { status: false, message: 'Read denied' }
          : { status: true, data: savedOffers() },
      );
    if (request.url.endsWith('/store_purchase_request_prices')) {
      if (failed) return response({ status: false, message: 'Invalid supplier price' });
      saved = true;
      return response({ status: true });
    }
    return response({ status: true, data: { data: [], meta: { last_page: 1 } } });
  });
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  );
});
afterEach(() => {
  PurchaseRequestPricesController.getInstance().release();
  PurchaseRequestController.getInstance().release();
  vi.unstubAllGlobals();
});

async function mountPage(locale: 'en' | 'ar' = 'en', query = '') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/organization/execution-quotes/show/:id', component: { template: '<div />' } },
      {
        path: '/organization/execution-quotes/show/:id/procurement',
        component: { template: '<div class="procurement-return" />' },
      },
      {
        path: '/organization/execution-quotes/show/:id/procurement/purchase-orders/add',
        component: { template: '<div class="order-return" />' },
      },
      {
        path: '/organization/execution-quotes/show/:id/procurement/purchase-requests/:purchaseRequestId/supplier-prices',
        component: SupplierPricesManagePage,
      },
    ],
  });
  await router.push(`${base}/purchase-requests/1/supplier-prices${query}`);
  const localization = createI18n({ legacy: false, locale, messages: { en, ar } });
  const wrapper = mount(
    { template: '<RouterView />' },
    {
      attachTo: document.body,
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
function stores() {
  return post.mock.calls.filter((call) => call[0].url.endsWith('/store_purchase_request_prices'));
}

it.each(['en', 'ar'] as const)(
  'loads saved offers directly in %s with the selected request',
  async (locale) => {
    const { router, wrapper } = await mountPage(locale);
    expect(wrapper.get('.supplier-prices-manage').attributes('dir')).toBe(
      locale === 'ar' ? 'rtl' : 'ltr',
    );
    expect(wrapper.get('.supplier-prices-summary').text()).toContain('Responsible Employee');
    expect(wrapper.findAll('.supplier-prices-row')).toHaveLength(2);
    expect(wrapper.get<HTMLInputElement>('input[inputmode="decimal"]').element.value).toBe(
      '1500.00',
    );
    expect(router.currentRoute.value.params).toMatchObject({ id: '140', purchaseRequestId: '1' });
    expect(wrapper.text()).toContain(
      locale === 'ar' ? 'إدارة أسعار الموردين' : 'Manage Supplier Prices',
    );
    wrapper.unmount();
  },
);

it('keeps unsaved edits until discard is confirmed, then returns to Procurement without saving', async () => {
  const { router, wrapper } = await mountPage();
  await wrapper.get('input[inputmode="decimal"]').setValue('200.25');
  await wrapper
    .findAll('button')
    .find((button) => button.text() === 'Cancel')
    ?.trigger('click');
  await flushPromises();
  const prompt = wrapper.getComponent(ProcurementDiscardConfirmation);
  expect(prompt.props('visible')).toBe(true);
  prompt.vm.$emit('keep');
  await flushPromises();
  expect(router.currentRoute.value.path).toContain('/supplier-prices');
  expect(wrapper.get<HTMLInputElement>('input[inputmode="decimal"]').element.value).toBe('200.25');
  await wrapper
    .findAll('button')
    .find((button) => button.text() === 'Cancel')
    ?.trigger('click');
  await flushPromises();
  prompt.vm.$emit('discard');
  await flushPromises();
  expect(router.currentRoute.value.path).toBe(base);
  expect(router.currentRoute.value.query).toEqual({ requestId: '1' });
  expect(stores()).toHaveLength(0);
  wrapper.unmount();
});

it('saves the complete supplier ID collection and refreshes before returning', async () => {
  const { router, wrapper } = await mountPage();
  await wrapper.get('input[inputmode="decimal"]').setValue('200.25');
  offers = [{ ...priceRecord(3, 15, 1), price: '200.25' }, priceRecord(4, 16, 1)];
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  expect(stores()[0]?.[0].data).toEqual({
    purchase_request_id: 1,
    suppliers: [
      { id: 3, price: 200.25, duration: 2, duration_type: 2 },
      { id: 4, price: 1500, duration: 2, duration_type: 2 },
    ],
  });
  expect(saved).toBe(true);
  expect(
    post.mock.calls.filter((call) => call[0].url.endsWith('/fetch_purchase_request_prices')).length,
  ).toBeGreaterThan(1);
  expect(router.currentRoute.value.path).toBe(base);
  wrapper.unmount();
});

it('returns to Purchase Order context and keeps the request ID', async () => {
  const { router, wrapper } = await mountPage('en', '?returnTo=order');
  await wrapper
    .findAll('button')
    .find((button) => button.text() === 'Cancel')
    ?.trigger('click');
  await flushPromises();
  expect(router.currentRoute.value.path).toBe(`${base}/purchase-orders/add`);
  expect(router.currentRoute.value.query).toEqual({ requestId: '1' });
  expect(stores()).toHaveLength(0);
  wrapper.unmount();
});

it('keeps the page and entered price after a failed Store', async () => {
  failed = true;
  const { router, wrapper } = await mountPage();
  await wrapper.get('input[inputmode="decimal"]').setValue('200.25');
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  expect(router.currentRoute.value.path).toContain('/supplier-prices');
  expect(wrapper.get<HTMLInputElement>('input[inputmode="decimal"]').element.value).toBe('200.25');
  expect(wrapper.text()).toContain('Invalid supplier price');
  expect(stores()).toHaveLength(1);
  wrapper.unmount();
});

it('keeps offers read-only when the Purchase Request is confirmed', async () => {
  status = 3;
  const { wrapper } = await mountPage();
  expect(wrapper.findAll('.supplier-prices-row')).toHaveLength(2);
  expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeDefined();
  expect(wrapper.text()).toContain('read-only after request confirmation');
  wrapper.unmount();
});

it('cannot synchronize after a failed initial fetch and recovers through Retry Fetch', async () => {
  fetchFailed = true;
  const { wrapper } = await mountPage();
  expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeDefined();
  await wrapper.get('form').trigger('submit');
  expect(stores()).toHaveLength(0);
  fetchFailed = false;
  await wrapper
    .findAll('button')
    .find((button) => button.text() === 'Retry Fetch')
    ?.trigger('click');
  await flushPromises();
  expect(wrapper.findAll('.supplier-prices-row')).toHaveLength(2);
  expect(stores()).toHaveLength(0);
  wrapper.unmount();
});
