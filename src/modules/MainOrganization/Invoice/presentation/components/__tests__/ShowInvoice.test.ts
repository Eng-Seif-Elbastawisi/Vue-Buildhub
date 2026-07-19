import { flushPromises, mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import AddInvoicePaymentParams from '@/modules/MainOrganization/InvoicePayment/core/params/add.invoice.payment.params';
import AddInvoicePaymentDialog from '../invoice_show/AddInvoicePaymentDialog.vue';
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
  invoice_amount: 3666,
  paid_amount: 500,
  remaining_amount: 3166,
  status: 2,
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
  children: [
    {
      id: 23,
      invoice_number: 'INV-sig-2026-0005.1',
      title: 'First child invoice',
      notes: 'First child note',
      invoice_amount: 3333,
      remaining_amount: 2833,
    },
  ],
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
  it('shows invoice-specific copy when invoice details are empty', () => {
    const wrapper = mount(ShowInvoice, {
      global: {
        mocks: {
          $t: (key: string) => key,
        },
        stubs: {
          DataStatusBuilder: {
            template: '<div><slot name="empty" /></div>',
          },
        },
      },
    });

    expect(wrapper.text()).toContain('invoice_show.empty');
  });

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
          UpdatedCustomInputSelect: true,
        },
      },
    });

    await flushPromises();

    expect(fetchInvoiceById).toHaveBeenCalledWith(7);
    expect(fetchInvoicePayments).toHaveBeenCalledWith(7);
    expect(wrapper.text()).toContain('INV-2026-0001');
    expect(wrapper.text()).toContain('Partial');
    expect(wrapper.text()).toContain('Client Name');
    expect(wrapper.text()).toContain('First child invoice');
    expect(wrapper.find('.invoice-payment-summary').text()).toContain('3,666.00 EGP');
    expect(wrapper.find('.invoice-payment-summary').text()).toContain('500.00 EGP');
    expect(wrapper.find('.invoice-payment-summary').text()).toContain('3,166.00 EGP');
  });

  it('opens the existing payment dialog and pays the selected child invoice', async () => {
    const wrapper = mount(ShowInvoice, {
      global: {
        mocks: {
          $t: (key: string) => key,
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
          UpdatedCustomInputSelect: true,
        },
      },
    });

    await flushPromises();
    await wrapper.find('.invoice-children-card__pay').trigger('click');

    const paymentDialog = wrapper.findComponent(AddInvoicePaymentDialog);
    const paymentParams = new AddInvoicePaymentParams({
      invoice_id: 23,
      payment_amount: 500,
      payment_date: '2026-07-19',
      payment_method: 1,
    });

    expect(paymentDialog.props('visible')).toBe(true);
    expect(paymentDialog.props('invoiceId')).toBe(23);
    expect(paymentDialog.find<HTMLInputElement>('#show_payment_amount').element.value).toBe('2833');

    paymentDialog.vm.$emit('submit', paymentParams);
    await flushPromises();

    expect(createInvoicePayment).toHaveBeenCalledWith(23, paymentParams);
  });
});
