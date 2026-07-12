import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import InvoicePaymentModel from '../../../core/models/invoice.payment.model';
import InvoicePaymentIndex from '../InvoicePaymentIndex.vue';

const fetchList = vi.fn();
const deletePayment = vi.fn();

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/stores/user', () => ({
  useUserStore: () => ({ user: { type: 2 } }),
}));

vi.mock('../../controllers/invoice.payment.controller', () => ({
  default: {
    getInstance: () => ({
      fetchList,
      delete: deletePayment,
      listState: { value: {} },
      pagination: { value: null },
    }),
  },
}));

describe('InvoicePaymentIndex', () => {
  it('fetches and renders invoice payment rows', async () => {
    const wrapper = mount(InvoicePaymentIndex, {
      global: {
        mocks: {
          $t: (key: string) => key,
        },
        stubs: {
          RouterLink: {
            props: ['to'],
            template: '<a><slot /></a>',
          },
          IndexAddIcon: true,
          Pagination: true,
          TableSkelaton: true,
          DeleteDialog: {
            template: '<button class="delete-dialog" type="button" @click="$emit(\'delete\')"><slot name="btn" /></button>',
          },
          DataStatusBuilder: {
            data() {
              return { rows: [InvoicePaymentModel.example] };
            },
            template: '<div><slot name="success" :data="rows" /></div>',
          },
          AppTable: {
            props: ['items'],
            template:
              '<div><div v-for="item in items" :key="item.id"><slot name="cell-invoice" :item="item" /><slot name="cell-payment_amount" :item="item" /><slot name="actions" :item="item" /></div></div>',
          },
        },
      },
    });

    expect(fetchList).toHaveBeenCalledTimes(1);
    expect(wrapper.text()).toContain('INV-2026-0001');
    expect(wrapper.text()).toContain('1,000');

    await wrapper.find('.delete-dialog').trigger('click');

    expect(deletePayment.mock.calls[0][0].toMap()).toEqual({ invoice_payment_id: 1 });
  });
});
