import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import InvoicePaymentModel from '@/modules/MainOrganization/InvoicePayment/core/models/invoice.payment.model';
import InvoicePaymentsCard from '../InvoicePaymentsCard.vue';

const formatAmount = (value?: number | string | null) => Number(value ?? 0).toFixed(2);

describe('InvoicePaymentsCard', () => {
  it('renders payments and emits add/download events', async () => {
    const wrapper = mount(InvoicePaymentsCard, {
      props: {
        payments: [InvoicePaymentModel.example],
        currency: 'EGP',
        formatAmount,
        formatDateTime: (value?: string | null) => value || '-',
        paymentMethodLabel: () => 'Bank transfer',
      },
      global: {
        mocks: {
          $t: (key: string) => key,
        },
      },
    });

    expect(wrapper.text()).toContain('1000.00 EGP');

    await wrapper.find('.invoice-show-btn').trigger('click');
    await wrapper.find('.invoice-show-icon-btn').trigger('click');

    expect(wrapper.emitted('add')).toHaveLength(1);
    expect(wrapper.emitted('download')?.[0][0]).toBe(InvoicePaymentModel.example);
  });
});
