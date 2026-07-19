import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import AddInvoicePaymentDialog from '../AddInvoicePaymentDialog.vue';

const globalOptions = {
  mocks: {
    $t: (key: string) => key,
  },
  stubs: {
    Teleport: true,
    UpdatedCustomInputSelect: {
      props: ['staticOptions', 'label'],
      template: `
        <select
          id="show_payment_method"
          class="payment-method-select"
          @change="$emit('update:modelValue', staticOptions.find((option) => option.id === Number($event.target.value)))"
        >
          <option v-for="option in staticOptions" :key="option.id" :value="option.id">
            {{ option.title }}
          </option>
        </select>
      `,
    },
  },
};

afterEach(() => {
  document.body.classList.remove('invoice-payment-dialog-open');
});

describe('AddInvoicePaymentDialog', () => {
  it('uses the remaining amount as the default payment amount when opened', () => {
    const wrapper = mount(AddInvoicePaymentDialog, {
      props: {
        visible: true,
        invoiceId: 4,
        remainingAmount: 1250.5,
      },
      global: globalOptions,
    });

    expect(wrapper.find<HTMLInputElement>('#show_payment_amount').element.value).toBe('1250.5');
  });

  it('emits payment params linked to the current invoice', async () => {
    const wrapper = mount(AddInvoicePaymentDialog, {
      props: {
        visible: true,
        invoiceId: 4,
      },
      global: globalOptions,
    });

    await wrapper.find('#show_payment_amount').setValue('750');
    await wrapper.find('#show_payment_date').setValue('2026-07-05');
    await wrapper.find('#show_payment_method').setValue('1');
    await wrapper.find('#show_payment_notes').setValue('First payment');
    await wrapper.find('form').trigger('submit');

    const params = wrapper.emitted('submit')?.[0][0] as { toMap: () => Record<string, unknown> };

    expect(params.toMap()).toEqual({
      invoice_id: 4,
      payment_amount: 750,
      payment_date: '2026-07-05',
      payment_method: 1,
      notes: 'First payment',
    });
    expect(document.body.classList.contains('invoice-payment-dialog-open')).toBe(true);
  });

  it('does not render invoice financial data inside the payment crud dialog', () => {
    const wrapper = mount(AddInvoicePaymentDialog, {
      props: {
        visible: true,
        invoiceId: 4,
      },
      global: globalOptions,
    });

    expect(wrapper.text()).not.toContain('invoice_show.remaining_amount');
  });
});
