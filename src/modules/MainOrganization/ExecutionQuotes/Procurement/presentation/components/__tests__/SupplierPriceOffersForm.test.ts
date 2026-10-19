import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import PrimeVue from 'primevue/config';
import Select from 'primevue/select';
import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
import TitleInterface from '@/base/Data/Models/titleInterface';
import SupplierPriceOffersForm from '../SupplierPriceOffersForm.vue';
import PurchaseRequestPricesController from '../../controllers/purchase-request-prices.controller';
import PurchaseRequestController from '../../controllers/purchase-request.controller';
import { mockNetwork, response } from '../../../../SiteTeam/__tests__/network';
import { activatePurchaseRequests, priceRecord } from '../../../__tests__/price-fixtures';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';
let post: ReturnType<typeof mockNetwork>;
const controller = PurchaseRequestPricesController.getInstance();
beforeEach(async () => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  );
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
        : { status: true, data: { data: [], meta: { last_page: 1 } } },
    ),
  );
  controller.activate(140, 1);
  await controller.fetchList();
});
afterEach(() => {
  controller.release();
  PurchaseRequestController.getInstance().release();
  vi.unstubAllGlobals();
});
function button(wrapper: VueWrapper, text: string) {
  const found = wrapper.findAll('button').find((button) => button.text() === text);
  if (!found) throw new Error(`Missing button: ${text}`);
  return found;
}
function mountForm() {
  return mount(SupplierPriceOffersForm, {
    attachTo: document.body,
    global: {
      plugins: [PrimeVue, createI18n({ legacy: false, locale: 'en', messages: { en, ar } })],
    },
  });
}
function stores() {
  return post.mock.calls.filter((call) => call[0].url.includes('store_purchase_request_prices'));
}
it('clear-all requires explicit confirmation and includes omitted suppliers by name', async () => {
  const wrapper = mountForm();
  await flushPromises();
  for (const remove of wrapper.findAll('button').filter((button) => button.text() === 'Remove'))
    await remove.trigger('click');
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  expect(stores()).toHaveLength(0);
  expect(wrapper.get('[role="alertdialog"]').text()).toContain(
    'Remove all supplier price offers for this purchase request?',
  );
  expect(wrapper.get('[role="alertdialog"]').text()).toContain('Supplier 3');
  post.mockImplementation(async (request) =>
    response(request.url.includes('store_') ? { status: true } : { status: true, data: [] }),
  );
  await button(wrapper, 'Confirm and Save').trigger('click');
  await flushPromises();
  expect(stores()[0]?.[0].data).toEqual({ purchase_request_id: 1, suppliers: [] });
  expect(wrapper.emitted('saved')).toHaveLength(1);
  expect(controller.savedOffers.value).toEqual([]);
  wrapper.unmount();
});
it('confirms removing one saved offer and sends remaining Supplier IDs', async () => {
  const wrapper = mountForm();
  await flushPromises();
  await wrapper
    .findAll('button')
    .find((button) => button.text() === 'Remove')
    ?.trigger('click');
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  expect(stores()).toHaveLength(0);
  expect(wrapper.get('[role="alertdialog"]').text()).toContain('Supplier 3');
  post.mockImplementation(async (request) =>
    response(
      request.url.endsWith('/store_purchase_request_prices')
        ? { status: true }
        : {
            status: true,
            data: [{ ...priceRecord(4, 16), supplier: { id: 4, title: 'Supplier 4' } }],
          },
    ),
  );
  await button(wrapper, 'Confirm and Save').trigger('click');
  await flushPromises();
  expect(stores()[0]?.[0].data).toEqual({
    purchase_request_id: 1,
    suppliers: [{ id: 4, price: 1500, duration: 2, duration_type: 2 }],
  });
  expect(wrapper.emitted('saved')).toHaveLength(1);
  wrapper.unmount();
});
it('failed Fetch disables Save and offers a read-only retry', async () => {
  post.mockResolvedValue(response({ status: false, message: 'Read denied' }));
  await controller.fetchList();
  const wrapper = mountForm();
  await flushPromises();
  expect(button(wrapper, 'Save Supplier Prices').attributes('disabled')).toBeDefined();
  await wrapper.get('form').trigger('submit');
  expect(stores()).toHaveLength(0);
  post.mockResolvedValue(response({ status: true, data: [] }));
  await button(wrapper, 'Retry Fetch').trigger('click');
  await flushPromises();
  await button(wrapper, 'Add Supplier').trigger('click');
  expect(wrapper.findAll('.procurement-item')).toHaveLength(1);
  wrapper.unmount();
});
it('failed save keeps all prices and shows actual feedback', async () => {
  const wrapper = mountForm();
  await flushPromises();
  await wrapper.get('input[inputmode="decimal"]').setValue('123.45');
  post.mockResolvedValue(response({ status: false, message: 'Invalid supplier price' }));
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  expect(wrapper.text()).toContain('Invalid supplier price');
  expect(wrapper.findAll('.procurement-item')).toHaveLength(2);
  expect((wrapper.get('input[inputmode="decimal"]').element as HTMLInputElement).value).toBe(
    '123.45',
  );
  expect(wrapper.emitted('saved')).toBeUndefined();
  wrapper.unmount();
});
it('rejects duplicate Supplier selection and resets the visible dropdown to its draft selection', async () => {
  const wrapper = mountForm();
  await flushPromises();
  await button(wrapper, 'Add Another Supplier').trigger('click');
  const row = wrapper.findAll('.procurement-item').at(-1);
  if (!row) throw new Error('Missing new supplier row');
  row
    .findAllComponents(Select)[0]
    ?.vm.$emit('update:modelValue', new TitleInterface({ id: 3, title: 'Supplier 3' }));
  await flushPromises();
  expect(wrapper.text()).toContain('Each supplier can appear only once.');
  expect(row.findAllComponents(Select)[0]?.props('modelValue')).toBeNull();
  expect(controller.draft.value.at(-1)?.supplier).toBeNull();
  expect(stores()).toHaveLength(0);
  wrapper.unmount();
});
it('adds a supplier row and searches the existing Supplier lookup', async () => {
  const wrapper = mountForm();
  await flushPromises();
  await button(wrapper, 'Add Another Supplier').trigger('click');
  const supplier = wrapper
    .findAllComponents(UpdatedCustomInputSelect)
    .find(
      (control) =>
        String(control.props('id')).endsWith('-supplier') && !control.props('modelValue'),
    );
  if (!supplier) throw new Error('Missing new supplier selector');
  supplier.vm.$emit('search', 'Acme');
  await flushPromises();
  expect(
    post.mock.calls.some(
      (call) => call[0].url.endsWith('/fetch_suppliers') && call[0].data?.word === 'Acme',
    ),
  ).toBe(true);
  supplier.vm.$emit('update:modelValue', new TitleInterface({ id: 8, title: 'Acme' }));
  await flushPromises();
  expect(controller.draft.value.at(-1)?.supplier?.id).toBe(8);
  expect(stores()).toHaveLength(0);
  wrapper.unmount();
});
it('shows row validation beside missing fields without synchronizing', async () => {
  const wrapper = mountForm();
  await flushPromises();
  await button(wrapper, 'Add Another Supplier').trigger('click');
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  expect(controller.errors.value.map((error) => error.field)).toEqual(
    expect.arrayContaining([
      'suppliers.2.supplierId',
      'suppliers.2.price',
      'suppliers.2.duration',
      'suppliers.2.durationType',
    ]),
  );
  expect(
    wrapper.findAll('.supplier-prices-row').at(-1)?.findAll('[role="alert"]').length,
  ).toBeGreaterThan(0);
  expect(stores()).toHaveLength(0);
  wrapper.unmount();
});
it('unconfirmed Sync and failed verification never display confirmed persistence feedback', async () => {
  const wrapper = mountForm();
  await flushPromises();
  await wrapper.get('input[inputmode="decimal"]').setValue('200.25');
  post.mockResolvedValue(response({ success: true }));
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  expect(button(wrapper, 'Save Supplier Prices').attributes('disabled')).toBeDefined();
  post.mockResolvedValue(response({ status: false, message: 'Verification failed' }));
  await button(wrapper, 'Retry Fetch').trigger('click');
  await flushPromises();
  expect(wrapper.text()).toContain('Persistence could not be confirmed.');
  expect(wrapper.text()).not.toContain('Offers were saved, but refreshing failed.');
  expect(controller.draft.value[0]?.price).toBe('200.25');
  expect(stores()).toHaveLength(1);
  wrapper.unmount();
});
