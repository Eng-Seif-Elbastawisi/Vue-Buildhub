import { flushPromises, mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import ShowInvoice from '../ShowInvoice.vue';

const fetchInvoiceById = vi.fn();
const fetchInvoicePayments = vi.fn();
const createInvoicePayment = vi.fn();
const invoiceData = vi.hoisted(() => ({
  id: 7,
  raw: {
    invoice_payments: [
      {
        id: 1,
        payment_amount: 1000,
        payment_date: '2026-07-05',
        payment_method: 1,
      },
    ],
  },
  invoice_number: 'INV-2026-0001',
  invoice_date: '2026-07-05',
  invoice_amount: 1000,
  currency: 'EGP',
  items: [],
  payments: [
    {
      id: 1,
      payment_amount: 1000,
      payment_date: '2026-07-05',
      payment_method: 1,
    },
  ],
  project: { id: 10, title: 'Tower project' },
  client: { id: 3, name: 'Client Name' },
  organization: { id: 1, name: 'Techlab' },
  created_by_employee: { id: 2, name: 'Techlab Employee' },
}));

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { id: '7' } }),
}));

vi.mock('@/stores/user', () => ({
  useUserStore: () => ({ user: { type: 2 } }),
}));

vi.mock('@/base/Presentation/Dialogs/dialog.manager', () => ({
  dialogManager: {
    toastSuccess: vi.fn(),
  },
}));

vi.mock('../../controllers/invoice.controller', () => ({
  default: {
    getInstance: () => ({
      fetchInvoiceById,
      itemState: { value: { data: invoiceData } },
      itemData: {
        value: invoiceData,
      },
    }),
  },
}));

vi.mock(
  '@/modules/MainOrganization/InvoicePayment/presentation/controllers/invoice.payment.controller',
  () => ({
    default: {
      getInstance: () => ({
        fetchInvoicePayments,
        createInvoicePayment,
      }),
    },
  }),
);

describe('ShowInvoice', () => {
  it('fetches invoice and invoice payments by route id and renders invoice details', async () => {
    const wrapper = mount(ShowInvoice, {
      global: {
        mocks: {
          $t: (key: string, params?: Record<string, string>) =>
            params?.number ? `${key} ${params.number}` : key,
        },
        stubs: {
          RouterLink: {
            props: ['to'],
            template: '<a><slot /></a>',
          },
          Teleport: true,
          DataStatusBuilder: {
            template: '<div><slot name="success" :data="$attrs.controller.data" /></div>',
          },
        },
      },
    });

    await flushPromises();

    expect(fetchInvoiceById).toHaveBeenCalledWith(7);
    expect(fetchInvoicePayments).toHaveBeenCalledWith(7);
    expect(wrapper.text()).toContain('INV-2026-0001');
    expect(wrapper.text()).toContain('Client Name');
  });
});
