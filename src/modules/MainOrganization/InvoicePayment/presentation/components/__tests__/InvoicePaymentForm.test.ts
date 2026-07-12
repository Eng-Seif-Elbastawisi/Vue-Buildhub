import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import InvoicePaymentModel from '../../../core/models/invoice.payment.model';
import InvoicePaymentForm from '../InvoicePaymentForm.vue';

vi.mock('vue-router', () => ({
  onBeforeRouteLeave: vi.fn(),
}));

vi.mock('@/stores/formsStore', () => ({
  useFormsStore: () => ({
    getFormData: vi.fn(),
    showReturnWarning: vi.fn(),
  }),
}));

vi.mock('@/modules/MainOrganization/Invoice/presentation/controllers/invoice.controller', () => ({
  default: {
    getInstance: () => ({}),
  },
}));

const mountForm = (payment?: InvoicePaymentModel) =>
  mount(InvoicePaymentForm, {
    props: {
      payment,
      formKey: '/invoice-payment/add',
    },
    global: {
      mocks: {
        $t: (key: string) => key,
      },
      stubs: {
        FieldHelpIcon: true,
        UpdatedCustomInputSelect: {
          props: ['label'],
          template:
            '<button class="invoice-select" type="button" @click="$emit(\'update:modelValue\', { id: 4, title: \'INV-2026-0001\' })">{{ label }}</button>',
        },
      },
    },
  });

describe('InvoicePaymentForm', () => {
  it('emits invoice payment params from invoice select and inputs', async () => {
    const wrapper = mountForm();

    await wrapper.find('.invoice-select').trigger('click');
    await wrapper.find('#payment_amount').setValue('1000');
    await wrapper.find('#payment_date').setValue('2026-07-05');
    await wrapper.find('#payment_method').setValue('1');
    await wrapper.find('#payment_notes').setValue('First payment');

    const emitted = wrapper.emitted('updateData')?.at(-1)?.[0] as {
      toMap: () => Record<string, unknown>;
    };

    expect(emitted.toMap()).toEqual({
      invoice_id: 4,
      payment_amount: 1000,
      payment_date: '2026-07-05',
      payment_method: 1,
      notes: 'First payment',
    });
  });

  it('hydrates fields from payment data in edit mode', () => {
    const wrapper = mountForm(InvoicePaymentModel.example);

    expect((wrapper.find('#payment_amount').element as HTMLInputElement).value).toBe('1000');
    expect((wrapper.find('#payment_date').element as HTMLInputElement).value).toBe('2026-07-05');
    expect((wrapper.find('#payment_method').element as HTMLInputElement).value).toBe('1');
  });
});
