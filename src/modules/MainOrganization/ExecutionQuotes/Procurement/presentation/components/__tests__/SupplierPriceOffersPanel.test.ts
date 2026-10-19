import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import PrimeVue from 'primevue/config';
import SupplierPriceOffersPanel from '../SupplierPriceOffersPanel.vue';
import PurchaseRequestPricesController from '../../controllers/purchase-request-prices.controller';
import PurchaseRequestController from '../../controllers/purchase-request.controller';
import { mockNetwork, response } from '../../../../SiteTeam/__tests__/network';
import { activatePurchaseRequests, priceRecord } from '../../../__tests__/price-fixtures';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';
let post: ReturnType<typeof mockNetwork>;
beforeEach(() => {
  post = mockNetwork();
  activatePurchaseRequests();
  post.mockImplementation(async (request) =>
    response(
      request.url.includes('fetch_purchase_request_prices')
        ? {
            status: true,
            data: [priceRecord(3, 15), priceRecord(4, 16)].map((offer) => ({
              ...offer,
              supplier: { id: offer.supplier.id, title: offer.supplier.name },
            })),
          }
        : { status: true, data: [] },
    ),
  );
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
it.each(['en', 'ar'])(
  'shows saved comparisons and localized labels with %s layout',
  async (locale) => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
    );
    const localization = createI18n({ legacy: false, locale, messages: { en, ar } });
    const wrapper = mount(SupplierPriceOffersPanel, {
      props: { quoteId: 140, purchaseRequestId: 1 },
      global: {
        plugins: [PrimeVue, localization],
        mocks: { $t: localization.global.t },
        stubs: { Dialog: { template: '<section><slot /></section>' } },
      },
    });
    await flushPromises();
    expect(wrapper.get('.procurement-offers').attributes('dir')).toBe(
      locale === 'ar' ? 'rtl' : 'ltr',
    );
    expect(wrapper.get('table').text()).toContain('Supplier 3');
    expect(wrapper.get('table').text()).toContain('1500.00');
    expect(wrapper.findAll('.procurement-item')).toHaveLength(0);
    expect(wrapper.find('form').exists()).toBe(false);
    const manage = wrapper
      .findAll('button')
      .find(
        (button) =>
          button.text() === (locale === 'ar' ? 'إدارة أسعار الموردين' : 'Manage Supplier Prices'),
      );
    await manage?.trigger('click');
    expect(wrapper.emitted('manageOffers')).toEqual([[1]]);
    expect(wrapper.find('form').exists()).toBe(false);
    expect(wrapper.text()).not.toContain('procurement.offers.');
    expect(wrapper.findAll('tbody tr')).toHaveLength(2);
    wrapper.unmount();
  },
);

it('disables the editor after failed Fetch and enables it only after a successful read retry', async () => {
  post.mockResolvedValue(response({ status: false, message: 'Read denied' }));
  const wrapper = mount(SupplierPriceOffersPanel, {
    props: { quoteId: 140, purchaseRequestId: 1 },
    global: {
      plugins: [PrimeVue, createI18n({ legacy: false, locale: 'en', messages: { en, ar } })],
      stubs: { Dialog: { template: '<section><slot /></section>' } },
    },
  });
  await flushPromises();
  const manage = wrapper
    .findAll('button')
    .find((button) => button.text() === 'Add Supplier Prices');
  expect(manage?.attributes('disabled')).toBeDefined();
  expect(wrapper.find('form').exists()).toBe(false);
  post.mockResolvedValue(response({ status: true, data: [] }));
  await wrapper
    .findAll('button')
    .find((button) => button.text() === 'Retry Fetch')
    ?.trigger('click');
  await flushPromises();
  expect(manage?.attributes('disabled')).toBeUndefined();
  await manage?.trigger('click');
  expect(wrapper.emitted('manageOffers')).toEqual([[1]]);
  expect(wrapper.find('form').exists()).toBe(false);
  expect(
    post.mock.calls.some((call) => call[0].url.includes('store_purchase_request_prices')),
  ).toBe(false);
  wrapper.unmount();
});
it('opening the management page does not mutate saved offers', async () => {
  const wrapper = mount(SupplierPriceOffersPanel, {
    props: { quoteId: 140, purchaseRequestId: 1 },
    global: {
      plugins: [PrimeVue, createI18n({ legacy: false, locale: 'en', messages: { en, ar } })],
      stubs: { Dialog: { template: '<section><slot /></section>' } },
    },
  });
  await flushPromises();
  await wrapper
    .findAll('button')
    .find((button) => button.text() === 'Manage Supplier Prices')
    ?.trigger('click');
  expect(wrapper.emitted('manageOffers')).toEqual([[1]]);
  expect(wrapper.find('form').exists()).toBe(false);
  expect(wrapper.get('table').text()).toContain('1500.00');
  expect(
    post.mock.calls.some((call) => call[0].url.includes('store_purchase_request_prices')),
  ).toBe(false);
  wrapper.unmount();
});
