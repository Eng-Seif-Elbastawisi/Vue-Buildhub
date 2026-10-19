import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { mount, flushPromises, enableAutoUnmount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import PrimeVue from 'primevue/config';
import Form from '../PurchaseOrderForm.vue';
import HandleFilesUpload from '@/shared/FormInputs/HandleFilesUpload.vue';
import Controller from '../../controllers/purchase.order.controller';
import Requests from '../../controllers/purchase-request.controller';
import RequestModel from '../../../core/models/purchase-request.model';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { ValidationException } from '@/base/Core/Constants/exceptionConstants';
import { mockNetwork, response } from '../../../../SiteTeam/__tests__/network';
import { requestRecord } from '../../../__tests__/fixtures';
import { priceRecord } from '../../../__tests__/price-fixtures';
import { orderRecord } from '../../../__tests__/order-fixtures';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';
enableAutoUnmount(afterEach);
let id = 50;
let post: ReturnType<typeof mockNetwork>;
let saved = false;
let failed = false;
let validationFailed = false;
beforeEach(() => {
  id++;
  saved = false;
  failed = false;
  validationFailed = false;
  post = mockNetwork();
  const requests = Requests.getInstance();
  requests.activate(140);
  requests.listState.value = new DataSuccess({
    data: [RequestModel.fromJson({ ...requestRecord(), id })],
  });
  post.mockImplementation(async (request) => {
    if (request.url.endsWith('/fetch_purchase_order'))
      return response({
        status: true,
        data: saved
          ? { ...orderRecord(), purchase_request: { ...orderRecord().purchase_request, id } }
          : null,
      });
    if (request.url.endsWith('/fetch_purchase_request_prices'))
      return response({ status: true, data: [priceRecord(3, 15, id)] });
    if (request.url.endsWith('/fetch_purchase_requests'))
      return response({ status: true, data: [{ ...requestRecord(), id, status: saved ? 3 : 1 }] });
    if (request.url.endsWith('/store_purchase_order')) {
      if (validationFailed)
        throw new ValidationException('Invalid date', { date: ['Date is invalid'] });
      if (failed) return response({ status: false, message: 'Status conflict' });
      saved = true;
      return response({ status: true });
    }
    throw new Error('Unexpected endpoint');
  });
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  );
});
afterEach(() => {
  Controller.getInstance().release();
  Requests.getInstance().release();
  vi.unstubAllGlobals();
});
function mountForm(locale = 'en') {
  const localization = createI18n({ legacy: false, locale, messages: { en, ar } });
  return mount(Form, {
    attachTo: document.body,
    props: { quoteId: 140, purchaseRequestId: id },
    global: {
      plugins: [PrimeVue, localization],
      mocks: { $t: localization.global.t },
    },
  });
}
async function choose(wrapper: ReturnType<typeof mountForm>) {
  await flushPromises();
  await wrapper.get('input[type="radio"]').setValue(true);
  await wrapper.get('#purchase-order-date').setValue('2026-10-14');
}
it.each(['en', 'ar'])(
  'uses shared uploader and selects offer ID in %s, then confirms the refreshed order',
  async (locale) => {
    const wrapper = mountForm(locale);
    await choose(wrapper);
    expect(wrapper.get('form').attributes('dir')).toBe(locale === 'ar' ? 'rtl' : 'ltr');
    expect(wrapper.findComponent(HandleFilesUpload).props('maxFiles')).toBe(1);
    const uploader = wrapper.getComponent(HandleFilesUpload);
    uploader.vm.$emit('change', [
      {
        id: 'a',
        name: 'order.pdf',
        type: 'application/pdf',
        size: '4 B',
        url: 'blob:file',
        base64: 'data:application/pdf;base64,JVBERg==',
      },
    ]);
    await wrapper.get('#purchase-order-note').setValue('Optional notes');
    await wrapper.get('form').trigger('submit');
    await flushPromises();
    const store = post.mock.calls.find((call) => call[0].url.endsWith('/store_purchase_order'));
    expect(store?.[0].data).toEqual({
      purchase_request_id: id,
      purchase_request_price_id: 15,
      note: 'Optional notes',
      file: 'data:application/pdf;base64,JVBERg==',
      date: '2026-10-14',
    });
    expect(wrapper.emitted('created')).toHaveLength(1);
    expect(wrapper.text()).toContain(
      locale === 'ar' ? 'تم حفظ أمر الشراء' : 'Purchase order created',
    );
    expect(wrapper.text()).not.toContain('Techlab Employee');
    expect(post.mock.calls.some((call) => call[0].url.endsWith('/fetch_purchase_order'))).toBe(
      true,
    );
    wrapper.unmount();
  },
);
it('requires date and offer but permits absent notes and attachment', async () => {
  const wrapper = mountForm();
  await flushPromises();
  await wrapper.get('form').trigger('submit');
  expect(post.mock.calls.some((call) => call[0].url.endsWith('/store_purchase_order'))).toBe(false);
  await choose(wrapper);
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  expect(
    post.mock.calls.find((call) => call[0].url.endsWith('/store_purchase_order'))?.[0].data,
  ).toEqual({
    purchase_request_id: id,
    purchase_request_price_id: 15,
    note: null,
    date: '2026-10-14',
  });
  wrapper.unmount();
});
it('shows field errors and focuses the missing offer before the date', async () => {
  const wrapper = mountForm();
  await flushPromises();
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  expect(wrapper.text()).toContain('Select a supplier price offer');
  expect(wrapper.text()).toContain('Enter a valid purchase order date');
  expect(wrapper.get('.purchase-order-offers').attributes('aria-invalid')).toBe('true');
  expect(document.activeElement?.getAttribute('name')).toBe('purchase-order-offer');
  await wrapper.get('input[type="radio"]').setValue(true);
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  expect(document.activeElement?.id).toBe('purchase-order-date');
  wrapper.unmount();
});
it('focuses a backend date error and preserves the selected offer', async () => {
  const wrapper = mountForm();
  await choose(wrapper);
  validationFailed = true;
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  expect(wrapper.text()).toContain('Date is invalid');
  expect(document.activeElement?.id).toBe('purchase-order-date');
  expect(wrapper.get('input[type="radio"]').element).toHaveProperty('checked', true);
  wrapper.unmount();
});
it('compares offers and submits the selected price-offer ID', async () => {
  const normal = post.getMockImplementation();
  if (!normal) throw new Error('Missing network mock');
  post.mockImplementation((request) =>
    request.url.endsWith('/fetch_purchase_request_prices')
      ? Promise.resolve(
          response({
            status: true,
            data: [
              { ...priceRecord(3, 15, id), supplier: { id: 3, title: 'Vendor A' } },
              {
                ...priceRecord(4, 16, id),
                supplier: { id: 4, title: 'Vendor B' },
                price: '1700.00',
              },
            ],
          }),
        )
      : normal(request),
  );
  const wrapper = mountForm();
  await flushPromises();
  expect(wrapper.findAll('.purchase-order-offer')).toHaveLength(2);
  expect(wrapper.get('.purchase-order-offers').attributes('role')).toBe('radiogroup');
  await wrapper.get('#order-offer-16').setValue(true);
  expect(wrapper.get('label[for="order-offer-16"]').classes()).toContain('is-selected');
  await wrapper.get('#purchase-order-date').setValue('2026-10-14');
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  expect(
    post.mock.calls.find((call) => call[0].url.endsWith('/store_purchase_order'))?.[0].data
      .purchase_request_price_id,
  ).toBe(16);
  wrapper.unmount();
});
it('explains when no supplier offers are available', async () => {
  const normal = post.getMockImplementation();
  if (!normal) throw new Error('Missing network mock');
  post.mockImplementation((request) =>
    request.url.endsWith('/fetch_purchase_request_prices')
      ? Promise.resolve(response({ status: true, data: [] }))
      : normal(request),
  );
  const wrapper = mountForm();
  await flushPromises();
  expect(wrapper.get('.purchase-order-offers-empty').text()).toContain('No supplier price offers');
  expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined();
  wrapper.unmount();
});
it('preserves form and shared attachment selection on Store failure and blocks replay', async () => {
  failed = true;
  const wrapper = mountForm();
  await choose(wrapper);
  const uploader = wrapper.getComponent(HandleFilesUpload);
  uploader.vm.$emit('change', [
    {
      id: 'a',
      name: 'file.txt',
      type: 'text/plain',
      size: '1 B',
      url: 'blob:file',
      base64: 'data:text/plain;base64,YQ==',
    },
  ]);
  await wrapper.get('#purchase-order-note').setValue('Keep my note');
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  expect(wrapper.get('#purchase-order-note').element).toHaveProperty('value', 'Keep my note');
  expect(wrapper.get('#purchase-order-date').element).toHaveProperty('value', '2026-10-14');
  expect(wrapper.get('input[type="radio"]').element).toHaveProperty('checked', true);
  expect(wrapper.getComponent(HandleFilesUpload).element).toBe(uploader.element);
  expect(wrapper.text()).toContain('Status conflict');
  await wrapper.get('form').trigger('submit');
  expect(
    post.mock.calls.filter((call) => call[0].url.endsWith('/store_purchase_order')),
  ).toHaveLength(1);
  wrapper.unmount();
});
it('disables issuing during shared Base64 conversion', async () => {
  const wrapper = mountForm();
  await choose(wrapper);
  const uploader = wrapper.getComponent(HandleFilesUpload);
  uploader.vm.$emit('processing', true);
  await wrapper.get('form').trigger('submit');
  expect(post.mock.calls.some((call) => call[0].url.endsWith('/store_purchase_order'))).toBe(false);
  uploader.vm.$emit('processing', false);
  uploader.vm.$emit('error');
  await wrapper.get('form').trigger('submit');
  expect(post.mock.calls.some((call) => call[0].url.endsWith('/store_purchase_order'))).toBe(false);
  wrapper.unmount();
});

it('keeps the actual shared uploader filename and Base64 data after a failed issue', async () => {
  failed = true;
  const objectUrl = URL.createObjectURL;
  URL.createObjectURL = () => 'blob:order-file';
  const wrapper = mountForm();
  try {
    await choose(wrapper);
    const input = wrapper.get('input[type="file"]');
    Object.defineProperty(input.element, 'files', {
      value: [new File(['a'], 'order.txt', { type: 'text/plain' })],
    });
    await input.trigger('change');
    await vi.waitFor(() => expect(wrapper.get('.preview-grid').text()).toContain('order.txt'));
    await wrapper.get('form').trigger('submit');
    await flushPromises();
    expect(
      post.mock.calls.find((call) => call[0].url.endsWith('/store_purchase_order'))?.[0].data.file,
    ).toBe('data:text/plain;base64,YQ==');
    expect(wrapper.get('.preview-grid').text()).toContain('order.txt');
    expect(wrapper.find('form').exists()).toBe(true);
  } finally {
    URL.createObjectURL = objectUrl;
    wrapper.unmount();
  }
});
