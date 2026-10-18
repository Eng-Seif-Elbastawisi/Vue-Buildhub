import { afterEach, expect, it, vi } from 'vitest';
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
import DisbursementStockModel from '../../../core/models/disbursement-stock.model';
import PurchaseRequestDisbursementModel from '../../../core/models/purchase-request-disbursement.model';
import MaterialDisbursementRepository from '../../../data/repositories/material-disbursement.repository';
import MaterialDisbursementHistoryRepository from '../../../data/repositories/material-disbursement-history.repository';
import { disbursementRecord, stockRecord } from '../../../__tests__/disbursement-fixtures';
import MaterialDisbursementController from '../../controllers/material-disbursement.controller';
import MaterialDisbursementPage from '../MaterialDisbursementPage.vue';

const SelectStub = defineComponent({
  props: { id: { type: String, required: true } },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () =>
      h(
        'button',
        {
          id: props.id,
          type: 'button',
          onClick: () =>
            emit('update:modelValue', new TitleInterface({ id: 7, title: 'Receiver' })),
        },
        'Select receiver',
      );
  },
});

afterEach(() => {
  MaterialDisbursementController.getInstance().release();
  vi.restoreAllMocks();
});

function mockRead(stock = [stockRecord()], history = [disbursementRecord()]) {
  const stockSpy = vi
    .spyOn(MaterialDisbursementRepository.getInstance(), 'index')
    .mockResolvedValue(new DataSuccess({ data: stock.map(DisbursementStockModel.fromJson) }));
  const historySpy = vi
    .spyOn(MaterialDisbursementHistoryRepository.getInstance(), 'show')
    .mockResolvedValue(
      new DataSuccess({ data: history.map(PurchaseRequestDisbursementModel.fromJson) }),
    );
  return { stockSpy, historySpy };
}

async function mountPage(locale: 'en' | 'ar' = 'en') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/organization/execution-quotes/show/:id', component: { template: '<div />' } },
      {
        path: '/organization/execution-quotes/show/:id/warehouse/material-receipt',
        component: { template: '<div />' },
      },
      {
        path: '/organization/execution-quotes/show/:id/warehouse/material-disbursement',
        component: { template: '<div />' },
      },
    ],
  });
  await router.push('/organization/execution-quotes/show/140/warehouse/material-disbursement');
  const dictionary = locale === 'ar' ? ar : en;
  const wrapper = mount(MaterialDisbursementPage, {
    global: {
      plugins: [router, PrimeVue],
      mocks: {
        $i18n: { locale },
        $t: (key: string) => dictionary[key as keyof typeof dictionary] ?? key,
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

it('starts from quote stock, issues only selected positive quantities, and reads authoritative history', async () => {
  const { stockSpy, historySpy } = mockRead([stockRecord(), stockRecord(10, '0.00')]);
  const create = vi
    .spyOn(MaterialDisbursementRepository.getInstance(), 'create')
    .mockResolvedValue(new DataSuccess<void>({ message: 'Saved' }));
  const wrapper = await mountPage();
  expect(stockSpy.mock.calls[0]?.[0]?.toMap()).toEqual({ quote_id: 140 });
  expect(historySpy.mock.calls[0]?.[0]?.toMap()).toEqual({ quote_id: 140 });
  expect(wrapper.text()).toContain('Available Warehouse Stock');
  expect(wrapper.text()).toContain('Issuer');
  expect(wrapper.find('#receipt-purchase-request').exists()).toBe(false);
  await wrapper
    .findAll('button')
    .find((button) => button.text().includes('Issue Materials'))
    ?.trigger('click');
  expect(wrapper.get('#issue-select-10').attributes('disabled')).toBeDefined();
  expect(wrapper.get('#issue-10').attributes('disabled')).toBeDefined();
  await wrapper.get('#issue-select-9').setValue(true);
  await wrapper.get('#issue-9').setValue('2.25');
  await wrapper.get('#disbursement-receiver').trigger('click');
  await wrapper.get('#disbursement-date').setValue('2026-10-15');
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  expect(create.mock.calls[0]?.[0]?.toMap()).toEqual({
    quote_id: 140,
    receiver_id: 7,
    date: '2026-10-15',
    items: [{ purchase_request_item_id: 9, quantity: 2.25 }],
  });
  expect(stockSpy).toHaveBeenCalledTimes(2);
  expect(historySpy).toHaveBeenCalledTimes(2);
  expect(wrapper.text()).toContain('Materials issued successfully');
  wrapper.unmount();
});

it('keeps entered quantities after a rejected issue and never retries Store', async () => {
  mockRead();
  const create = vi
    .spyOn(MaterialDisbursementRepository.getInstance(), 'create')
    .mockResolvedValue(
      new DataFailed({ error: new ErrorModel('Insufficient stock', ErrorType.validation) }),
    );
  const wrapper = await mountPage();
  await wrapper
    .findAll('button')
    .find((button) => button.text().includes('Issue Materials'))
    ?.trigger('click');
  await wrapper.get('#issue-select-9').setValue(true);
  await wrapper.get('#issue-9').setValue('2');
  await wrapper.get('#disbursement-receiver').trigger('click');
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  expect(create).toHaveBeenCalledTimes(1);
  expect(wrapper.get<HTMLInputElement>('#issue-9').element.value).toBe('2');
  expect(wrapper.text()).toContain('Insufficient stock');
  wrapper.unmount();
});

it('renders Arabic RTL and read-only historical details', async () => {
  mockRead();
  const wrapper = await mountPage('ar');
  expect(wrapper.get('.material-disbursement').attributes('dir')).toBe('rtl');
  expect(wrapper.text()).toContain('سجل صرف المواد');
  await wrapper
    .findAll('button')
    .find((button) => button.text().includes('تفاصيل'))
    ?.trigger('click');
  expect(wrapper.text()).toContain('Item 9');
  expect(wrapper.text()).toContain('1.50');
  expect(wrapper.text()).toContain('2.00');
  wrapper.unmount();
});
