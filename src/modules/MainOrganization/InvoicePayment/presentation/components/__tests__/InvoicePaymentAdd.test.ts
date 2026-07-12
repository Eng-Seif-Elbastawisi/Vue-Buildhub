import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import AddInvoicePaymentParams from '../../../core/params/add.invoice.payment.params';
import InvoicePaymentAdd from '../InvoicePaymentAdd.vue';

const create = vi.fn();

vi.mock('vue-router', () => ({
  useRoute: () => ({ fullPath: '/invoice-payment/add' }),
}));

vi.mock('@/modules/MainOrganization/Invoice/presentation/controllers/invoice.controller', () => ({
  default: {
    getInstance: () => ({}),
  },
}));

vi.mock('../../controllers/invoice.payment.controller', () => ({
  default: {
    getInstance: () => ({
      create,
      errorMessage: { value: null },
    }),
  },
}));

describe('InvoicePaymentAdd', () => {
  it('creates invoice payment with emitted form params', async () => {
    const params = new AddInvoicePaymentParams({
      invoice_id: 4,
      payment_amount: 1000,
      payment_date: '2026-07-05',
      payment_method: 1,
      notes: 'First payment',
    });

    const wrapper = mount(InvoicePaymentAdd, {
      global: {
        mocks: {
          $t: (key: string) => key,
        },
        stubs: {
          InvoicePaymentForm: {
            template:
              '<button class="emit-form" type="button" @click="$emit(\'updateData\', params)">form</button>',
            setup() {
              return { params };
            },
          },
        },
      },
    });

    await wrapper.find('.emit-form').trigger('click');
    await wrapper.find('.btn').trigger('click');

    expect(create).toHaveBeenCalledWith(params, undefined, '/invoice-payment/add');
  });
});
