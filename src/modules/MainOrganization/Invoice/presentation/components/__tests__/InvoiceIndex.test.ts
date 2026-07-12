import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import InvoiceModel from '../../../core/models/invoice.model';
import InvoiceIndex from '../InvoiceIndex.vue';

const fetchList = vi.fn();
const deleteInvoice = vi.fn();

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/stores/user', () => ({
  useUserStore: () => ({ user: { type: 2 } }),
}));

vi.mock('../../controllers/invoice.controller', () => ({
  default: {
    getInstance: () => ({
      fetchList,
      delete: deleteInvoice,
      listState: { value: {} },
      pagination: { value: null },
    }),
  },
}));

describe('InvoiceIndex', () => {
  it('fetches and renders invoice rows', async () => {
    const wrapper = mount(InvoiceIndex, {
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
            template:
              '<button class="delete-dialog" type="button" @click="$emit(\'delete\')"><slot name="btn" /></button>',
          },
          DataStatusBuilder: {
            data() {
              return { rows: [InvoiceModel.example] };
            },
            template: '<div><slot name="success" :data="rows" /></div>',
          },
          AppTable: {
            props: ['items'],
            template:
              '<div><div v-for="item in items" :key="item.id"><span>{{ item.invoice_number }}</span><slot name="cell-project" :item="item" /><slot name="cell-invoice_amount" :item="item" /><slot name="actions" :item="item" /></div></div>',
          },
        },
      },
    });

    expect(fetchList).toHaveBeenCalledTimes(1);
    expect(wrapper.text()).toContain('INV-2026-0001');
    expect(wrapper.text()).toContain('Commercial project');

    await wrapper.find('.delete-dialog').trigger('click');

    expect(deleteInvoice.mock.calls[0][0].toMap()).toEqual({ invoice_id: 1 });
  });
});
