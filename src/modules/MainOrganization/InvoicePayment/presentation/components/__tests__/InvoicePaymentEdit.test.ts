import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import InvoicePaymentModel from '../../../core/models/invoice.payment.model';
import AddInvoicePaymentParams from '../../../core/params/add.invoice.payment.params';
import InvoicePaymentEdit from '../InvoicePaymentEdit.vue';

const fetchOne = vi.fn();
const update = vi.fn();

vi.mock('vue-router', () => ({
  useRoute: () => ({ fullPath: '/invoice-payment/edit/7', params: { id: '7' } }),
}));

vi.mock('@/modules/MainOrganization/Invoice/presentation/controllers/invoice.controller', () => ({
  default: {
    getInstance: () => ({}),
  },
}));

vi.mock('../../controllers/invoice.payment.controller', () => ({
  default: {
    getInstance: () => ({
      fetchOne,
      update,
      itemData: { value: InvoicePaymentModel.example },
      errorMessage: { value: null },
    }),
  },
}));

describe('InvoicePaymentEdit', () => {
  it('fetches invoice payment and updates with payment id', async () => {
    const params = new AddInvoicePaymentParams({
      invoice_id: 4,
      payment_amount: 1000,
      payment_date: '2026-07-05',
      payment_method: 1,
      notes: 'First payment',
    });

    const wrapper = mount(InvoicePaymentEdit, {
      global: {
        mocks: {
          $t: (key: string) => key,
        },
        stubs: {
          InvoicePaymentForm: {
            template: '<button class="emit-form" type="button" @click="$emit(\'updateData\', params)">form</button>',
            setup() {
              return { params };
            },
          },
        },
      },
    });

    await wrapper.find('.emit-form').trigger('click');
    await wrapper.find('.btn').trigger('click');

    expect(fetchOne.mock.calls[0][0].toMap()).toEqual({ invoice_payment_id: 7 });
    expect(update.mock.calls[0][0].toMap()).toEqual({
      invoice_payment_id: 7,
      invoice_id: 4,
      payment_amount: 1000,
      payment_date: '2026-07-05',
      payment_method: 1,
      notes: 'First payment',
    });
  });
});
