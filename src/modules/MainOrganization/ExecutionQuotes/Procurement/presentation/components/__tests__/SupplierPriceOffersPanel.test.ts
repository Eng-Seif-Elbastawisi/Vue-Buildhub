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
        ? { status: true, data: [priceRecord(3, 15), priceRecord(4, 16)] }
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
      .find((button) => button.text() === (locale === 'ar' ? 'إدارة الأسعار' : 'Manage Prices'));
    await manage?.trigger('click');
    await flushPromises();
    expect(wrapper.findAll('.procurement-item')).toHaveLength(2);
    expect(wrapper.text()).not.toContain('procurement.offers.');
    await wrapper.get('#supplier-comparison-filter').setValue('Supplier 4');
    expect(wrapper.findAll('tbody tr')).toHaveLength(1);
    expect(
      wrapper
        .findAll('form input[inputmode="decimal"]')
        .map((input) => (input.element as HTMLInputElement).value),
    ).toEqual(['1500.00', '1500.00']);
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
  await flushPromises();
  expect(wrapper.find('form').exists()).toBe(true);
  expect(
    post.mock.calls.some((call) => call[0].url.includes('store_purchase_request_prices')),
  ).toBe(false);
  wrapper.unmount();
});
it('discarding editor changes restores the saved collection when reopening', async () => {
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
    .find((button) => button.text() === 'Manage Prices')
    ?.trigger('click');
  await flushPromises();
  await wrapper.get('input[inputmode="decimal"]').setValue('123.45');
  await wrapper
    .findAll('button')
    .find((button) => button.text() === 'Cancel')
    ?.trigger('click');
  await flushPromises();
  await wrapper
    .findAll('button')
    .find((button) => button.text() === 'Discard Changes')
    ?.trigger('click');
  await flushPromises();
  expect(wrapper.find('form').exists()).toBe(false);
  expect(wrapper.get('table').text()).toContain('1500.00');
  await wrapper
    .findAll('button')
    .find((button) => button.text() === 'Manage Prices')
    ?.trigger('click');
  await flushPromises();
  expect((wrapper.get('input[inputmode="decimal"]').element as HTMLInputElement).value).toBe(
    '1500.00',
  );
  wrapper.unmount();
});
