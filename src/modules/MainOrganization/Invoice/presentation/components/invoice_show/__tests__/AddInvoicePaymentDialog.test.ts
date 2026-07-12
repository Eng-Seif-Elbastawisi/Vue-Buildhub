import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import AddInvoicePaymentDialog from '../AddInvoicePaymentDialog.vue';

const formatAmount = (value?: number | string | null) => Number(value ?? 0).toFixed(2);

describe('AddInvoicePaymentDialog', () => {
  it('emits payment params linked to the current invoice', async () => {
    const wrapper = mount(AddInvoicePaymentDialog, {
      props: {
        visible: true,
        invoiceId: 4,
        remainingAmount: 1000,
        currency: 'EGP',
        formatAmount,
      },
      global: {
        mocks: {
          $t: (key: string) => key,
        },
        stubs: {
          Teleport: true,
        },
      },
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
  });
});
