import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InvoiceStatusEnum } from '../../../core/constant/invoice.status.enum';
import { InvoiceTypeEnum } from '../../../core/constant/invoice.type.enum';
import InvoiceModel from '../../../core/models/invoice.model';
import InvoiceIndex from '../InvoiceIndex.vue';

const fetchList = vi.fn();
const deleteInvoice = vi.fn();
let routeQuery: Record<string, string | undefined> = {};

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: routeQuery }),
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
  beforeEach(() => {
    fetchList.mockClear();
    deleteInvoice.mockClear();
    routeQuery = {};
  });

  it('fetches and renders invoice rows with payment status badges', async () => {
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
              return {
                rows: [
                  new InvoiceModel({
                    id: 1,
                    project: { id: 10, title: 'Commercial project' },
                    invoice_number: 'INV-2026-0001',
                    status: InvoiceStatusEnum.PAID,
                    invoice_type: InvoiceTypeEnum.SINGLE,
                  }),
                  new InvoiceModel({
                    id: 2,
                    invoice_number: 'INV-UNPAID',
                    status: InvoiceStatusEnum.UNPAID,
                    invoice_type: InvoiceTypeEnum.GROUP,
                  }),
                  new InvoiceModel({
                    id: 3,
                    invoice_number: 'INV-PARTIAL',
                    status: InvoiceStatusEnum.PARTIAL,
                  }),
                ],
              };
            },
            template: '<div><slot name="success" :data="rows" /></div>',
          },
          AppTable: {
            props: ['items'],
            template:
              '<div><div v-for="item in items" :key="item.id"><span>{{ item.invoice_number }}</span><slot name="cell-project" :item="item" /><slot name="cell-invoice_amount" :item="item" /><slot name="cell-status" :item="item" /><slot name="cell-invoice_type" :item="item" /><slot name="actions" :item="item" /></div></div>',
          },
        },
      },
    });

    expect(fetchList).toHaveBeenCalledTimes(1);
    expect(fetchList.mock.calls[0][0].toMap()).not.toHaveProperty('status');
    expect(wrapper.text()).toContain('INV-2026-0001');
    expect(wrapper.text()).toContain('Commercial project');
    expect(wrapper.find('.invoice-status-badge.is-paid').text()).toBe('Paid');
    expect(wrapper.find('.invoice-status-badge.is-unpaid').text()).toBe('Unpaid');
    expect(wrapper.find('.invoice-status-badge.is-partial').text()).toBe('Partial');
    expect(wrapper.text()).toContain('Single Invoice');
    expect(wrapper.text()).toContain('Group Invoice');

    await wrapper.find('.delete-dialog').trigger('click');

    expect(deleteInvoice.mock.calls[0][0].toMap()).toEqual({ invoice_id: 2 });
  });

  it('sends invoice status from route query when filtering paid invoices', () => {
    routeQuery = { status: String(InvoiceStatusEnum.PAID) };

    const wrapper = mount(InvoiceIndex, {
      global: {
        mocks: {
          $t: (key: string) => key,
        },
        stubs: {
          RouterLink: true,
          IndexAddIcon: true,
          Pagination: true,
          TableSkelaton: true,
          DeleteDialog: true,
          DataStatusBuilder: {
            template: '<div><slot name="success" :data="[]" /></div>',
          },
          AppTable: true,
        },
      },
    });

    expect(fetchList.mock.calls[0][0].toMap()).toMatchObject({
      invoice_status: InvoiceStatusEnum.PAID,
    });
    expect(wrapper.text()).toContain('sidebar.paid_invoices');
  });
});
