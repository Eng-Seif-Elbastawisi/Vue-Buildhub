import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createMemoryHistory, createRouter } from 'vue-router';
import { defineComponent, h } from 'vue';
import PrimeVue from 'primevue/config';
import TitleInterface from '@/base/Data/Models/titleInterface';
import {
  DataFailed,
  DataSuccess,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { ErrorModel, ErrorType } from '@/base/Core/NetworkStructure/Resources/errors/errorModel';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';
import PurchaseRequestModel from '../../../../Procurement/core/models/purchase-request.model';
import PurchaseRequestRepository from '../../../../Procurement/data/repositories/purchase-request.repository';
import PurchaseOrderRepository from '../../../../Procurement/data/repositories/purchase.order.repository';
import type PurchaseOrderModel from '../../../../Procurement/core/models/purchase.order.model';
import { requestRecord } from '../../../../Procurement/__tests__/fixtures';
import MaterialReceiptRepository from '../../../data/repositories/material-receipt.repository';
import MaterialReceiptHistoryRepository from '../../../data/repositories/material-receipt-history.repository';
import PurchaseRequestReceiptItemSummaryModel from '../../../core/models/purchase-request-receipt-item-summary.model';
import PurchaseRequestReceiptModel from '../../../core/models/purchase-request-receipt.model';
import MaterialReceiptController from '../../controllers/material-receipt.controller';
import MaterialReceiptPage from '../MaterialReceiptPage.vue';

const SelectStub = defineComponent({
  props: { id: { type: String, required: true }, modelValue: { type: Object, default: null } },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () =>
      h(
        'button',
        {
          type: 'button',
          id: props.id,
          onClick: () =>
            emit(
              'update:modelValue',
              new TitleInterface({
                id: props.id === 'receipt-purchase-request' ? 1 : 7,
                title: 'Selection',
              }),
            ),
        },
        props.id,
      );
  },
});
beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    },
  );
});
afterEach(() => {
  MaterialReceiptController.getInstance().release();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
function mockData() {
  vi.spyOn(PurchaseRequestRepository.getInstance(), 'index').mockResolvedValue(
    new DataSuccess({ data: [PurchaseRequestModel.fromJson(requestRecord())] }),
  );
  vi.spyOn(PurchaseOrderRepository.getInstance(), 'show').mockResolvedValue(
    new DataSuccess({
      data: { status: 3, purchaseRequest: { id: 1, quoteId: 140 } } as PurchaseOrderModel,
    }),
  );
  vi.spyOn(MaterialReceiptRepository.getInstance(), 'index').mockResolvedValue(
    new DataSuccess({
      data: [
        PurchaseRequestReceiptItemSummaryModel.fromJson({
          purchase_request_item: requestRecord().items[0],
          requested_quantity: '10.00',
          received_quantity: '6.00',
          remaining_quantity: '4.00',
        }),
      ],
    }),
  );
  vi.spyOn(MaterialReceiptHistoryRepository.getInstance(), 'show').mockResolvedValue(
    new DataSuccess({
      data: [
        PurchaseRequestReceiptModel.fromJson({
          id: 3,
          purchase_request_id: 1,
          quote_id: 140,
          project_id: 86,
          employee: { id: 7, name: 'Receiver', type: 2 },
          organization_employee: { id: 1, name: 'Recorder', type: 1 },
          status: 1,
          date: '2026-10-15',
          items: [{ id: 5, purchase_request_item: requestRecord().items[0], quantity: '1.00' }],
          created_at: '2026-10-15 08:06:17',
        }),
      ],
    }),
  );
}
async function mountPage(locale: 'en' | 'ar') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/organization/execution-quotes/show/:id',
        component: { template: '<div />' },
      },
      {
        path: '/organization/execution-quotes/show/:id/warehouse/material-receipt',
        component: { template: '<div />' },
      },
    ],
  });
  await router.push('/organization/execution-quotes/show/140/warehouse/material-receipt');
  const wrapper = mount(MaterialReceiptPage, {
    global: {
      plugins: [router, PrimeVue],
      mocks: {
        $i18n: { locale },
        $t: (key: string) => (locale === 'ar' ? ar : en)[key as keyof typeof en] ?? key,
      },
      stubs: {
        UpdatedCustomInputSelect: SelectStub,
        FieldHelpIcon: true,
        ProjectWorkspaceNav: true,
      },
    },
  });
  await flushPromises();
  return wrapper;
}
it('selects a Purchase Request first, submits only its positive item quantity, and shows read-only history', async () => {
  mockData();
  const create = vi
    .spyOn(MaterialReceiptRepository.getInstance(), 'create')
    .mockResolvedValue(new DataSuccess<void>({ message: 'Saved' }));
  const wrapper = await mountPage('en');
  expect(wrapper.find('#receive-1').exists()).toBe(false);
  expect(wrapper.findAll('[role="tab"]')).toHaveLength(0);
  expect(wrapper.get('#receipt-history-heading').text()).toBe('Receiving History');
  expect(wrapper.text()).toContain('Recorder');
  await wrapper
    .findAll('button')
    .find((button) => button.text().includes('New Receipt'))
    ?.trigger('click');
  expect(wrapper.find('#receipt-purchase-request').exists()).toBe(true);
  await wrapper.get('#receipt-purchase-request').trigger('click');
  await flushPromises();
  expect(wrapper.get('#receive-1').attributes('disabled')).toBeUndefined();
  expect(wrapper.text()).toContain('Material Title');
  await wrapper.get('#receive-1').setValue('2');
  await wrapper.get('#receipt-employee').trigger('click');
  await wrapper
    .findAll('button')
    .find((button) => button.text().includes('Save Receipt'))
    ?.trigger('click');
  await flushPromises();
  expect(create.mock.calls[0]?.[0]?.toMap()).toEqual({
    purchase_request_id: 1,
    employee_id: 7,
    date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
    items: [{ purchase_request_item_id: 1, quantity: 2 }],
  });
  expect(wrapper.text()).toContain('Receiver');
  await wrapper
    .findAll('button')
    .find((button) => button.text() === 'Close')
    ?.trigger('click');
  expect(wrapper.text()).toContain('Recorder');
  expect(wrapper.text()).toContain('Partially Received');
  await wrapper
    .findAll('button')
    .find((button) => button.text() === 'Details')
    ?.trigger('click');
  expect(wrapper.text()).toContain('1.00');
  wrapper.unmount();
});
it('renders Arabic RTL and keeps completed rows disabled', async () => {
  mockData();
  vi.spyOn(MaterialReceiptRepository.getInstance(), 'index').mockResolvedValue(
    new DataSuccess({
      data: [
        PurchaseRequestReceiptItemSummaryModel.fromJson({
          purchase_request_item: requestRecord().items[0],
          requested_quantity: '10.00',
          received_quantity: '10.00',
          remaining_quantity: '0.00',
        }),
      ],
    }),
  );
  const wrapper = await mountPage('ar');
  await wrapper
    .findAll('button')
    .find((button) => button.text().includes('استلام جديد'))
    ?.trigger('click');
  await wrapper.get('#receipt-purchase-request').trigger('click');
  await flushPromises();
  expect(wrapper.get('.material-receipt').attributes('dir')).toBe('rtl');
  expect(wrapper.get('#receive-1').attributes('disabled')).toBeDefined();
  expect(wrapper.text()).toContain('تم استلام جميع أصناف هذا الطلب بالكامل');
  wrapper.unmount();
});
it('opens the receipt dialog from history and keeps history visible afterward', async () => {
  mockData();
  const summary = vi.mocked(MaterialReceiptRepository.getInstance().index);
  const wrapper = await mountPage('en');
  expect(summary).not.toHaveBeenCalled();
  await wrapper
    .findAll('button')
    .find((button) => button.text().includes('New Receipt'))
    ?.trigger('click');
  expect(summary).not.toHaveBeenCalled();
  await wrapper.get('#receipt-purchase-request').trigger('click');
  await flushPromises();
  expect(MaterialReceiptController.getInstance().purchaseRequestId.value).toBe(1);
  expect(summary.mock.calls[0]?.[0]?.toMap()).toEqual({ purchase_request_id: 1 });
  expect(wrapper.get('#receive-1').exists()).toBe(true);
  await wrapper
    .findAll('button')
    .find((button) => button.text() === 'Close')
    ?.trigger('click');
  expect(MaterialReceiptController.getInstance().purchaseRequestId.value).toBeNull();
  expect(wrapper.text()).toContain('Recorder');
  wrapper.unmount();
});
it('keeps history available when there are no purchase requests to receive', async () => {
  vi.spyOn(PurchaseRequestRepository.getInstance(), 'index').mockResolvedValue(
    new DataSuccess({ data: [] }),
  );
  vi.spyOn(MaterialReceiptHistoryRepository.getInstance(), 'show').mockResolvedValue(
    new DataSuccess({ data: [] }),
  );
  const wrapper = await mountPage('en');
  expect(wrapper.findAll('[role="tab"]')).toHaveLength(0);
  expect(wrapper.text()).toContain('No Receipts');
  await wrapper
    .findAll('button')
    .find((button) => button.text().includes('New Receipt'))
    ?.trigger('click');
  expect(wrapper.text()).toContain('No purchase requests yet');
  expect(wrapper.find('#receive-1').exists()).toBe(false);
  wrapper.unmount();
});

it('keeps receipt quantities and date editable after a save failure', async () => {
  mockData();
  vi.spyOn(MaterialReceiptRepository.getInstance(), 'create').mockResolvedValue(
    new DataFailed({ error: new ErrorModel('Save failed', ErrorType.validation) }),
  );
  const wrapper = await mountPage('en');
  await wrapper
    .findAll('button')
    .find((button) => button.text().includes('New Receipt'))
    ?.trigger('click');
  await wrapper.get('#receipt-purchase-request').trigger('click');
  await flushPromises();
  await wrapper.get('#receive-1').setValue('2');
  await wrapper.get('#receipt-date').setValue('2026-10-14');
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  expect(wrapper.get<HTMLInputElement>('#receive-1').element.value).toBe('2');
  expect(wrapper.get<HTMLInputElement>('#receipt-date').element.value).toBe('2026-10-14');
  expect(wrapper.get('#receive-1').attributes('disabled')).toBeUndefined();
  expect(wrapper.text()).toContain('Save failed');
  wrapper.unmount();
});
